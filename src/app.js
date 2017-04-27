"use strict";

const $ = require('jquery');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;
const Common = require('./common');
const task = require('./task');

let $openProject = $('#js-open-project');
let $delProject = $('#js-del-project');
let $projectList = $('#js-project-list');
let $buildDevButton = $('#js-build-dev');
let $welcome = $('#js-welcome');
let $logButton = $('#js-log-button');
let $settingButton = $('#js-setting-button');
let $setting = $('#js-setting');
let $settingClose = $('#js-setting-close');
let $settingProjectName = $('#setting-project-name');
let $workspaceSection = $('#js-workspace');
let $log = $('#js-log');
let $logContent = $log.find('.logs__inner');
let $logStatus = $('#js-logs-status');
let $curProject = null;
let workConfig = {};

let bsObj = {};
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
        setWatching();
    } else {
        setNormal();
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
$('#js-tasks').find('.tasks__button').on('click', async function () {
    let $this = $(this);
    clearTimeout(taskTimer);
    taskTimer = setTimeout(function () {
        let taskName = $this.data('task');
        runTask(taskName, $this);
    }, 200);
});

//全局设置和项目设置
//点击全局设置按钮的时候
//1. 初始化数据
//2. 显示设置面板
//3. 显示 workspace 设置区域
//4. 隐藏 删除项目 按钮
$settingButton.on('click', function () {
    settingFn();
});

function settingFn() {
    // curConfigPath = Common.CONFIGPATH;
    // initConfig();

    if ($setting.hasClass('hide')) {
        $setting.removeClass('hide');
        $setting.data('config', 'all');
        $settingProjectName.text('全局');
        $workspaceSection.show();
        // $workspaceSection.removeClass('hide');
        // $delProjectBtn.addClass('hide');
    } else {
        $setting.addClass('hide');
    }
}

//关闭设置面板
$settingClose.on('click', function () {
    $setting.addClass('hide');
});

//点击项目信息的时候
//1.先判断一下项目配置文件是否存在
//2.如果不存在则复制一份全局的过去
//3.初始化设置面板数据
//4.隐藏工作区设置
//5.显示 项目删除 按钮
//6.显示设置面板
$projectList.on('click', '.projects__info', function () {
    settingCurrentProject();
});

function settingCurrentProject() {
    let projectPath = $curProject.attr('title');
    $settingProjectName.text($curProject.data('project') + ' ');
    $setting.data('config', $curProject.data('project'));
    $workspaceSection.hide();
    // curConfigPath = path.join(projectPath, Common.CONFIGNAME);

    // //如果当前项目下的 config 不存在的时候,先挪过去
    // if (!Common.fileExist(curConfigPath)) {
    //     gulp.src(Common.CONFIGPATH)
    //         .pipe(gulp.dest(projectPath))
    //         .on('end', function () {
    //             console.log('create weflow.config.json success');
    //             initConfig();
    //         });
    // } else {
    //     initConfig();
    // }

    // $workspaceSection.addClass('hide');
    // $delProjectBtn.removeClass('hide');
    $setting.removeClass('hide');
}




//如果是第一次打开,设置数据并存储
//其他则直接初始化数据 v
function init() {
    // checkForUpdate();
    let storage = Common.getStorage();
    if (!storage) {
        $welcome.removeClass('hide');
        initWorkConfig();
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

function initWorkConfig() {
    let storage = {};
    storage.workconfig = {
        svnPage: '',
        svnStatic: '',
        livereload: true,
        compress: false,
        reversion: true,
        jsPath: 'js',
        cssPath: 'css',
        imagesPath: 'images',
        lessPath: 'less',
        sassPath: 'sass'
    };
    Common.setStorage(storage);
}

//初始化数据
function initData() {
    let storage = Common.getStorage();
    let title = '';

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

async function runTask(taskName, context) {
    $logStatus.text('Running...');

    let projecName = $curProject.data('project');
    let storage = Common.getStorage();
    let projectConfig = storage.projects[projecName];

    if (taskName === 'dev') {
        if ($buildDevButton.data('devwatch')) {
            killBs();
            $logStatus.text('Done');
        } else {
            // dev(projectPath, function (data) {
            //     logReply(data);
            // }, function (bs) {
            //     bsObj[projectPath] = bs;
            //     setWatching();
            //     $logStatus.text('Done');
            // });
            let bs = await task.dev(projectConfig);
            bsObj[projectConfig.path] = bs;
            setWatching();
            $logStatus.text('Done');
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
    var projectPath = $curProject.attr('title');
    if (bsObj[projectPath]) {
        try {
            bsObj[projectPath].exit();
            logReply('Listening has quit.');
            console.log('Listening has quit.');
        } catch (err) {
            console.log(err);
        }
    }

    bsObj[$curProject.attr('title')] = null;
    // setNormal();
}

// 打印日志
function logReply(data) {
    let D = new Date();
    let h = D.getHours();
    let m = D.getMinutes();
    let s = D.getSeconds();

    $logContent.append(`<div><span class="logs__time">[${h}:${m}:${s}]</span> ${data}</div>`);
    $logContent.scrollTop($logContent.get(0).scrollHeight);
}


function setNormal() {
    $buildDevButton.removeClass('tasks__button_watching');
    $buildDevButton.text('开发');
    $buildDevButton.data('devwatch', false);

    $curProject.removeClass('projects__list-item_watching');
    $curProject.data('watch', false);
}

function setWatching() {
    $buildDevButton.addClass('tasks__button_watching');
    $buildDevButton.text('监听中…');
    $buildDevButton.data('devwatch', true);

    $curProject.addClass('projects__list-item_watching');
    $curProject.data('watch', true);
}