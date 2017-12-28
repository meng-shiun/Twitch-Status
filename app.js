$(document).ready(function() {

  const allUser = [
    'esl_sc2',
    'OgamingSC2',
    'basetradetv',
    'noobs2ninjas',
    'supermcgamer',
    'honeymad',
    'twitchpresents'
  ];

  var userInfo = [];
  var onlineUser = [];
  var offlineUser = [];

  const allUserList     = $('.all-user-list');
  const onlineUserList  = $('.online-user-list');
  const offlineUserList = $('.offline-user-list');

  loadTwitchAPI();

  function getTwitchAPI(url) {
    return $.ajax({
      type: 'GET',
      url: url,
      dataType: 'jsonp'
    });
  }

  function loadTwitchAPI() {

    for (let i = 0; i < allUser.length; i++) {
      let user = allUser[i];
      let isUserOnline, userLogo, currentGame, channel_url;

      let userObj = {
        user: allUser[i],
        isOnline: isUserOnline,
        logo: userLogo,
        des: currentGame,
        url: channel_url
      };

      // Store every user
      userInfo.push(userObj);

      // Make 2 API calls to Twitch
      $.when(
        getTwitchAPI(`https://wind-bow.gomix.me/twitch-api/streams/${user}`),  // Call to check user status (Online/ Offline)
        getTwitchAPI(`https://wind-bow.gomix.me/twitch-api/channels/${user}`)  // Call to fetch other information
      )
      .always(function(statusData, infoData) {
        // Check if user is online and put users in different array
        isUserOnline = statusData[0].stream !== null ? true : false;
        userInfo[i].isOnline = isUserOnline;
        userInfo[i].user = infoData[0].display_name;
        userInfo[i].logo = infoData[0].logo;
        userInfo[i].des = infoData[0].game;
        userInfo[i].url = infoData[0].url;

        // Wait till everything is done in the loop
        if (i == allUser.length - 1) {
          sortUsers(userInfo);
        }
      })
    }
  }


  // Sort user in each category
  function sortUsers(userInfo) {

    // Content for each list item
    let addContent = function(name, online, url, logo, des) {

      des = (des.length >= 18) ? des.substr(0, 15) + '...' : des;

      logo === undefined ? (logo = 'images/user.svg') : (logo = logo);

      return `
      <a href="${url}" target="blank" class="list-group-item list-group-item-action">
      <div class="row">
      <div class="col-2 user-icon">
      <img src="${logo}" class="logo">
      </div>
      <div class="col">
      <h2 class="user-title">${name}</h2>
      <span class="user-des">${des}</span>
      </div>
      <div class="col-2">
      <p class="user-status text-center ${online}"></p>
      </div>
      </div>
      </a>
      `;
    }

    for (let i = 0; i < userInfo.length; i++) {

      let user = userInfo[i];

      // Push to online/ offline users
      let onlineStatus = false;
      let description = '';

      if (user.isOnline) {
        onlineUser.push(user);
        onlineStatus = 'online';
        description = user.des;
      } else {
        offlineUser.push(user);
        onlineStatus = 'offline';
        description = '';
      }

      // All users
      allUserList.append(addContent(user.user, onlineStatus, user.url, user.logo, description));
    }

    // Online users
    onlineUser.forEach(function(user) {
      onlineUserList.append(addContent(user.user, 'online', user.url, user.logo, user.des));
    });

    // Offline users
    offlineUser.forEach(function(user) {
      offlineUserList.append(addContent(user.user, 'offline', user.url, user.logo, ''));
    });

    filterUser(userInfo, onlineUser, offlineUser);
  }


  // Filter search
  function filterUser(userInfo, onlineUser, offlineUser) {

    let searchAllList     = []; // Add all user to search list
    let searchOnlineList  = []; // Add online user to search list
    let searchOfflineList = []; // Add offline user to search list

    // Push users in each search list
    let addToList = (oldArr, searchList) => oldArr.forEach(element => searchList.push(element.user.toLowerCase()));

    addToList(userInfo, searchAllList);
    addToList(onlineUser, searchOnlineList);
    addToList(offlineUser, searchOfflineList);

    $('#filter_users').on('keyup', function() {
      // Find search value from input
      let keyword = $(this).val().toLowerCase();

      // Check if user in 3 lists match search value
      function findMatchUser(searchList, userSection) {
        for (let i = 0; i < searchList.length; i++) {
          let user = userSection.find('a').eq(i);
          // Remove results which don't match
          searchList[i].indexOf(keyword) === -1 ? user.hide() : user.show()
        }
      }

      findMatchUser(searchAllList, allUserList);          // Filter all users search
      findMatchUser(searchOnlineList, onlineUserList);    // Filter online users search
      findMatchUser(searchOfflineList, offlineUserList);  // Filter offline users search
    });
  }



});
