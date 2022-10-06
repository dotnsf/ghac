//. main.js
$(function(){
  $('#github_user').keyup( function( e ){
    showUserRepo();
  });
  $('#github_repo').keyup( function( e ){
    showUserRepo();
  });
  $('#github_issue_num').keyup( function( e ){
    var issue_num = $('#github_issue_num').val();
    if( issue_num ){
      $('.mybtn').prop( 'disabled', true );
      $('#mybtn-comments').prop( 'disabled', false );
    }else{
      $('.mybtn').prop( 'disabled', false );
      $('#mybtn-comments').prop( 'disabled', true );
    }
  });
});

function showUserRepo(){
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  var user_repo = user + '/' + repo;
  $('#user_repo').html( user_repo );
}

function getIssues(){
  $('#debug').html( '' );
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  if( user && repo ){
    var token = $('#github_token').val();
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/issues/' + user + '/' + repo + '?token=' + token,
      success: function( result ){
        console.log( result );
        showRateLimitReset( result );
        $('#debug').css( 'color', '#008' );
        $('#debug').html( JSON.stringify( result.issues, null, 2 ) );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }
}

function getComments(){
  $('#debug').html( '' );
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  if( user && repo ){
    var issue_num = $('#github_issue_num').val();
    var token = $('#github_token').val();
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/comments/' + user + '/' + repo + '?token=' + token + '&issue_num=' + issue_num,
      success: function( result ){
        console.log( result );
        showRateLimitReset( result );
        $('#debug').css( 'color', '#080' );
        $('#debug').html( JSON.stringify( result.comments, null, 2 ) );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }
}

function getAssignees(){
  $('#debug').html( '' );
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  if( user && repo ){
    var token = $('#github_token').val();
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/assignees/' + user + '/' + repo + '?token=' + token,
      success: function( result ){
        console.log( result );
        showRateLimitReset( result );
        $('#debug').css( 'color', '#088' );
        $('#debug').html( JSON.stringify( result.assignees, null, 2 ) );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }
}

function getLabels(){
  $('#debug').html( '' );
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  if( user && repo ){
    var token = $('#github_token').val();
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/labels/' + user + '/' + repo + '?token=' + token,
      success: function( result ){
        console.log( result );
        showRateLimitReset( result );
        $('#debug').css( 'color', '#880' );
        $('#debug').html( JSON.stringify( result.labels, null, 2 ) );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }
}

function getMilestones(){
  $('#debug').html( '' );
  var user = $('#github_user').val();
  var repo = $('#github_repo').val();
  if( user && repo ){
    var token = $('#github_token').val();
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/milestones/' + user + '/' + repo + '?token=' + token,
      success: function( result ){
        console.log( result );
        showRateLimitReset( result );
        $('#debug').css( 'color', '#800' );
        $('#debug').html( JSON.stringify( result.milestones, null, 2 ) );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }
}

function showRateLimitReset( result ){
  if( result && result.headers && result.headers['x-ratelimit-reset'] ){
    var remain = result.headers['x-ratelimit-remaining'];
    var limit = result.headers['x-ratelimit-limit'];
    var remaining = remain + '/' + limit;
    
    var reset = result.headers['x-ratelimit-reset'];
    if( typeof reset == 'string' ){ reset = parseInt( reset ); }
    reset *= 1000;
    var t = new Date( reset );

    var y = t.getFullYear();
    var m = t.getMonth() + 1;
    var d = t.getDate();
    var h = t.getHours();
    var n = t.getMinutes();
    var s = t.getSeconds();

    var ymdhns = y
      + '-' + ( m < 10 ? '0' : '' ) + m
      + '-' + ( d < 10 ? '0' : '' ) + d
      + ' ' + ( h < 10 ? '0' : '' ) + h
      + ':' + ( n < 10 ? '0' : '' ) + n
      + ':' + ( s < 10 ? '0' : '' ) + s;

    $('#ratelimit-remaining').html( remaining );
    $('#ratelimit-reset').html( ymdhns );
  }
}

function myLogin(){
  location.href = '/login';
}

function myLogout(){
  if( confirm( "ログアウトしますか？" ) ){
    location.href = '/logout';
  }
}

