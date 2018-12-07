

var floorIdForSchedule,imgForSchedule;
var targetingIdInFloor;

var floorDetailSchedular = function(){
    floorIdForSchedule = localStorage.getItem('floorId');
    setupForShowPins(floorIdForSchedule,imgForSchedule);
};

var createFloorMap = function(floorId,img){
    imgForSchedule = img;
    var scale = 0;
    if(img.width > img.height){
        scale = DISPLAY_AREA_WIDTH / img.width;
    }else {
        scale = DISPLAY_AREA_HEIGHT / img.height;
    }

    img.width  = img.width  * scale;
    img.height = img.height * scale;
    setupForShowPins(floorId,img);

    console.log('width=' + img.width, 'height=' + img.height);
    // <img>要素としてDOMに追加
    $('.floor-map').append(img);
};

var setupForShowPins = function(floorId,img){
    var companyCode = fetchCompanyCode();
    var url = PROTOCOL + companyCode + BASE_URL + BASE_URL_VERSION + '/users/location/?floor_id=' + floorId;
    var headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Accept-Language':'ja'};
    axios({
        method : 'GET',
        url    : url,
        headers : headers,
    }).then(function(response){
        var usersInFloor = response.data.result.users;
        showPins(usersInFloor,img,floorId);
    }).catch(function (error) {
        _errorOccuerred(error);
    });
};

var showPins= function(usersInFloor,img,floorId){
    // ユーザーが素早くフロア間で遷移した場合、タイマーで起動していた関数によって前のフロアのユーザーピンが表示されてしまうことを防止する
    if(floorId != localStorage.getItem('floorId')){
        console.log('Blocked wrong floor pins...');
        return;
    }
    $('.pin-wrapper').remove();
    var usersInThisFloor = [];
    usersInFloor.forEach(function(user){
        var width  = user.floor.x * img.width;
        var height = user.floor.y * img.height;
        var userForFloorDetail = {id: user.id,name: user.name, x: user.floor.x, y: user.floor.y, width: width, height: height};
        usersInThisFloor.push(userForFloorDetail);
    });
    var clusterIdentifiers = [];
    usersInThisFloor.forEach(function(user){
        // userをクラスタの1人目に設定
        var cluster = {size: 1, name: [user.name], sumX: user.x, sumY: user.y, width: 0, height: 0};
        var distance = 0;
        var ownId = user.id;
        var ownX = user.x;
        var ownY = user.y;
        usersInThisFloor.forEach(function(innerUser){
            if(innerUser.id != ownId){
                if(innerUser.x > ownX - 0.1 && innerUser.x < ownX + 0.1 && innerUser.y > ownY - 0.2 && innerUser.y < ownY + 0.2){
                    cluster.size += 1;
                    cluster.name.push(innerUser.name);
                    cluster.sumX += innerUser.x;
                    cluster.sumY += innerUser.y;
                }
            }
        });
        var position = '';
        // クラスタの中身が2以上 = クラスタリングが発生している場合
        if(cluster.size >= 2){
            var cancelFlag = false;

            var clusterX = cluster.sumX / cluster.size;
            var clusterY = cluster.sumY / cluster.size;
            var width  = clusterX * img.width;
            var height = clusterY * img.height;
            var clusterIdentifier = width * height;

            if(clusterIdentifier.toString().includes('.')){    
                clusterIdentifier = clusterIdentifier.toString().replace('.','');
            }
            // 極小の誤差で異なるクラスタが作られてしまう問題を防ぐために先頭5桁を切り出す(identifierは5桁でも十分と想定)
            clusterIdentifier = clusterIdentifier.toString().slice(0,5); 
            var id = '#cluster' + clusterIdentifier;
            clusterIdentifiers.forEach(function(identifier){
                if(identifier == clusterIdentifier){
                    cancelFlag = true;
                }
            });
            if(cancelFlag){
                return;
            }
            clusterIdentifiers.push(clusterIdentifier);
            
            var nameList = '';
            var selectedPinClass = '';
            cluster.name.forEach(function(name){
                if(name == trackingUserName){
                    nameList += '<span class="target-user-name">';
                    nameList += name;
                    nameList += '</span>';
                    nameList += '<br>';
                    selectedPinClass = 'selected-';
                }else{
                    nameList += name;
                    nameList += '<br>';
                }
            });

            position = 'style="top:' + height + 'px; left:' + width + 'px;"';
            $('.floor-map').append('<div id="' + id + '" class="pin-wrapper cluster"'+ position + '><div class="' + selectedPinClass + 'pin"><span>' + cluster.size + '</span></div><div class="balloon2-top"><p>' + nameList + '</p></div></div>');
            selectedPinClass = '';
        }else {
            var userNameInP;
            position = 'style="top:' + user.height + 'px; left:' + user.width + 'px;"';
            if(user.name == trackingUserName){
                userNameInP = '<span class="target-user-name">' + user.name + '</span>';
                $('.floor-map').append('<div class="pin-wrapper" '+ position + '><div class="selected-pin"><span></span></div><div class="balloon2-top"><p>' + userNameInP + '</p></div></div>');
            }else{
                userNameInP = user.name;
                $('.floor-map').append('<div class="pin-wrapper" '+ position + '><div class="pin"><span></span></div><div class="balloon2-top"><p>' + userNameInP + '</p></div></div>');
            }
        }
    });
};

// フロア詳細画面の戻るボタン押下時の処理
// どの画面から遷移してきたかをlocalStorageを使って取得して、その値に応じて戻る画面先を動的に変更する
$('.back-button').on('click',function(){
    var transitionTo = localStorage.getItem('transition_source');
    $('.floor-detail').hide();
    $('#' + transitionTo).show();
    if(transitionTo == HERE_TAB){
        switchTabAndDisplayArea(HERE_TAB);
    }else if(transitionTo == FLOOR_LIST_TAB){
        switchTabAndDisplayArea(FLOOR_TAB);
    }else if(transitionTo == MAP_TAB){
        switchTabAndDisplayArea(MAP_TAB);
    }
});

// フロア一覧画面からフロア詳細画面への遷移
$(document).on("click",".floor-list-item", function() {
    var clickedFloorId =  $(this).attr("data-floorid");
    localStorage.setItem('transition_source', FLOOR_LIST_TAB);
    changeTimerToShowingTab(FLOOR_DETAIL_TAB);
    showFloorDetail(clickedFloorId);
});