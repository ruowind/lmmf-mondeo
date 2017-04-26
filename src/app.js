"use strict";

const $ = require('jquery');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;
const Common = require('./common');

require('./menu');

let $openProject = $('#js-open-project');
let $delProject = $('#js-del-project');
let $projectList = $('#js-project-list');
let $buildDevButton = $('#js-build-dev');
let $welcome = $('#js-welcome');
let $logButton = $('#js-log-button');
let $log = $('#js-log');
let $logStatus = $('#js-logs-status');
let $curProject = null;

let FinderTitle = Common.PLATFORM === 'win32' ? '在 文件夹 中查看' : '在 Finder 中查看';

init();

// 打开项目按钮
$openProject.on('change', function () {
    if (this && this.files.length) {
        let projectPath = this.files[0].path;
        openProject(projectPath);
    } else {
        alert('选择目录出错,请重新选择!');
    }
});

//项目列表绑定点击事件
$projectList.on('click', '.projects__list-item', function () {
    let $this = $(this);
    $('.projects__list-item').removeClass('projects__list-item_current');
    $this.addClass('projects__list-item_current');
    $curProject = $this;

    if ($this.data('watch')) {
        // setWatching();
    } else {
        // setNormal();
    }
});

//打开项目所在目录
$projectList.on('click', '[data-finder=true]', function () {
    let $this = $(this);
    let projectPath = $this.parents('.projects__list-item').attr('title');

    if (projectPath) {
        shell.showItemInFolder(projectPath);
    }
});

//删除项目
$delProject.on('click', function () {
    delProject();
});

//log 切换
$logButton.on('click', function () {
    let $this = $(this);

    if ($this.hasClass('icon-log_green')) {
        $this.removeClass('icon-log_green');
    } else {
        $this.addClass('icon-log_green');
    }

    if ($log.hasClass('logs_show')) {
        $log.removeClass('logs_show');
        $projectList.removeClass('projects__list_high');
    } else {
        $log.addClass('logs_show');
        $projectList.addClass('projects__list_high');
    }
});

let taskTimer = null;

//绑定任务按钮事件
$('#js-tasks').find('.tasks__button').on('click', function () {
    let $this = $(this);
    clearTimeout(taskTimer);
    taskTimer = setTimeout(function () {
        let taskName = $this.data('task');
        runTask(taskName, $this);
    }, 200);
});

//如果是第一次打开,设置数据并存储
//其他则直接初始化数据 v
function init() {
    // checkForUpdate();
    let storage = Common.getStorage();
    if (!storage) {
        $welcome.removeClass('hide');
        // storage = {};
        // storage.name = Common.NAME;
        // Common.setStorage(storage);

        // let workspace = path.join(remote.app.getPath(Common.DEFAULT_PATH), Common.WORKSPACE);

        // fs.mkdir(workspace, function (err) {
        //     if (err) {
        //         throw new Error(err);
        //     }
        //     $formWorkspace.val(workspace);

        //     storage.workspace = workspace;
        //     Common.setStorage(storage);

        //     console.log('Create workspace success.');
        // });
    } else {
        checkLocalProjects();
        initData();
    }
}

//每次启动的时候检查本地项目是否还存在 不存在的就清除
function checkLocalProjects() {
    let storage = Common.getStorage();
    if (storage) {
        if (storage.projects) {
            let projects = storage.projects;
            $.each(projects, function (key, project) {
                if (!Common.dirExist(project.path)) {
                    delete projects[key];
                }
            });
            storage.projects = projects;
        }
        Common.setStorage(storage);
    }
}

//初始化数据
function initData() {
    let storage = Common.getStorage();
    let title = '';

    if (storage) {
        if (!_.isEmpty(storage['projects'])) {
            let html = '';
            for (let i in storage['projects']) {
                html += `<li class="projects__list-item" data-project="${i}" title="${storage['projects'][i]['path']}">
                              <span class="icon icon-finder" data-finder="true" title="${FinderTitle}"></span>
                              <div class="projects__list-content">
                                  <span class="projects__name">${i}</span>
                                  <div class="projects__path">${storage['projects'][i]['path']}</div>
                              </div>
                              <a href="javascript:;" class="icon icon-info projects__info"></a>
                        </li>`;
            }
            $projectList.html(html);
            //当前活动项目
            $curProject = $projectList.find('.projects__list-item').eq(0);
            $curProject.addClass('projects__list-item_current');

        } else {
            $welcome.removeClass('hide');
        }
    }
}

// 打开项目
function openProject(projectPath) {
    let storage = Common.getStorage();
    let projectName = path.basename(projectPath);

    storage || (storage = {});
    if (!storage['projects']) {
        storage['projects'] = {};
    }

    if (storage['projects'][projectName]) {
        alert('项目已存在');
    } else {
        storage['projects'][projectName] = {};
        storage['projects'][projectName]['path'] = projectPath;
        Common.setStorage(storage);

        //插入打开的项目
        insertOpenProject(projectPath);
    }

}

// 插入打开的项目
function insertOpenProject(projectPath) {

    if (!$welcome.hasClass('hide')) {
        $welcome.addClass('hide');
    }

    //插入节点
    let projectName = path.basename(projectPath);

    let $projectHtml = $(`<li class="projects__list-item" data-project="${projectName}" title="${projectPath}">
                              <span class="icon icon-finder" data-finder="true" title="${FinderTitle}"></span>
                              <div class="projects__list-content">
                                  <span class="projects__name">${projectName}</span>
                                  <div class="projects__path">${projectPath}</div>
                              </div>
                              <a href="javascript:;" class="icon icon-info projects__info" title="项目设置"></a>
                        </li>`);

    $projectList.append($projectHtml);

    $projectList.scrollTop($projectList.get(0).scrollHeight);

    // $projectHtml.trigger('click');

    //只有在节点成功插入了才保存进 storage
    let storage = Common.getStorage();
    storage || (storage = {});

    if (!storage['projects']) {
        storage['projects'] = {};
    }
    if (!storage['projects'][projectName]) {
        storage['projects'][projectName] = {};
    }

    storage['projects'][projectName]['path'] = projectPath;

    Common.setStorage(storage);

}

// 移除项目
function delProject(cb) {
    if (!$curProject.length) {
        return;
    }
    let projectName = $curProject.data('project');
    let index = $curProject.index();

    killBs();

    $curProject.remove();

    if (index > 0) {
        $('.projects__list-item').eq(index - 1).click();
    }

    // $curProject.trigger('click');

    let storage = Common.getStorage();

    if (storage && storage['projects'] && storage['projects'][projectName]) {
        delete storage['projects'][projectName];
        Common.setStorage(storage);
    }

    if (_.isEmpty(storage['projects'])) {
        $welcome.removeClass('hide');
    }

    console.log('remove project success.');

    cb && cb();
}

function runTask(taskName, context) {
    $logStatus.text('Running...');

    let projectPath = $curProject.attr('title');

    if (taskName === 'dev') {
        if ($buildDevButton.data('devwatch')) {
            killBs();
            $logStatus.text('Done');
        } else {
            dev(projectPath, function (data) {
                logReply(data);
            }, function (bs) {
                bsObj[projectPath] = bs;
                setWatching();
                $logStatus.text('Done');
            });
        }
    }

    // if (taskName === 'dist') {
    //     context.text('执行中');
    //     dist(projectPath, function (data) {
    //         logReply(data);
    //     }, function () {
    //         setTimeout(function () {
    //             $logStatus.text('Done');
    //             logReply('dist 编译完成');
    //             console.log('dist 编译完成');
    //             context.text('生产编译')
    //         }, 500);
    //     });
    // }

    // if (taskName === 'zip') {
    //     context.text('执行中');
    //     dist(projectPath, function (data) {
    //         logReply(data);
    //     }, function () {
    //         zip(projectPath, function (data) {
    //             logReply(data);
    //         }, function () {
    //             setTimeout(function () {
    //                 $logStatus.text('Done');
    //                 logReply('打包完成');
    //                 console.log('打包完成');
    //                 context.text('打包');
    //             }, 500);
    //         });
    //     });
    // }

    // if (taskName === 'ftp') {

    //     let projectPath = $curProject.attr('title');

    //     let projectConfigPath = path.join(projectPath, 'weflow.config.json');
    //     let projectConfig = null;

    //     if (Common.fileExist(projectConfigPath)) {
    //         projectConfig = Common.requireUncached(projectConfigPath);
    //     } else {
    //         projectConfig = Common.requireUncached(Common.CONFIGPATH);
    //     }

    //     let deploy = projectConfig['ftp']['ssh'] ? sftp : ftp;


    //     context.text('执行中');
    //     dist(projectPath, function (data) {
    //         logReply(data);
    //     }, function () {

    //         deploy(projectPath, function (data) {
    //             logReply(data);
    //         }, function (data) {
    //             if (data) {
    //                 alert('请在设置中配置 服务器上传 信息');
    //                 $logStatus.text('Done');
    //                 logReply('上传中断');
    //                 console.log('上传中断');
    //                 context.text('上传');
    //             } else {
    //                 setTimeout(function () {
    //                     $logStatus.text('Done');
    //                     logReply('上传完成');
    //                     console.log('上传完成');
    //                     context.text('上传');
    //                 }, 500);
    //             }
    //         })
    //     })
    // }
}

// 结束本地服务
function killBs() {
    // var projectPath = $curProject.attr('title');
    // if (bsObj[projectPath]) {
    //     try {
    //         bsObj[projectPath].exit();
    //         logReply('Listening has quit.');
    //         console.log('Listening has quit.');
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    // bsObj[$curProject.attr('title')] = null;
    // setNormal();
}