var notificationTimer = null;
var notificationCounter = 0;
var notificationFixedTop = 0;

var createNotification = function(userWentOut){
    // 何個目の通知ウィンドウかによって画面最上部からの表示位置を動的に変更する
    notificationCounter += 1;
    var fixedTop = '';
    if(notificationCounter >= 2){
        notificationFixedTop = SPACE_BETWEEN_NOTIFICATION_WINDOW * (notificationCounter-1);
        fixedTop = 'style="top:' + notificationFixedTop + 'px"';
    }



    $('.notification-container').append(boxStartTag + boxPersonPin + innerBoxPtag); 

    $('.box').addClass('is-show');

    // 通知ウィンドウを指定した時間にクリアするタイマーをセット
    notificationTimer = setTimeout(function(){
        // 各種クリア処理
        $('.box').removeClass('is-show');
        clearTimeout(notificationTimer);
        $('.notification-container').empty();
    },NOTIFICATION_WINDOW_CLEAR_TIME);
};

var checkUsersGoOutsideInInterval = function(){
    var usersShouldDisplayNotifications = [];

    // 前回中にいたひとたち
    var usersInsideLastTime = userListLastTime.filter(function(user){
        return user.floor;
    });
    // 今回外にいるひとたち
    var usersOutsideThisTime = userList.filter(function(user){
        return user.gps;
    });

    usersInsideLastTime.forEach(function(userInside){
        usersOutsideThisTime.forEach(function(userOutside){
            if(userOutside.id == userInside.id){
                usersShouldDisplayNotifications.push(userOutside);
            }
        });
    });
    console.log('usersShouldDisplayNotifications = ',usersShouldDisplayNotifications);
    // インターバルの間に外出したユーザー分だけforを回して通知divを描画する
    usersShouldDisplayNotifications.forEach(function(userForNotification){
        createNotification(userForNotification);
    });
    notificationCounter = 0;
    notificationFixedTop = 0;
};

