function validateKey() {
  var inputValue = document.getElementById('passkey').value;
  var theFrame = document.getElementById('my_iframe');
  if (inputValue.length === 5) {
    var completeUrl =
      'https://onedrive.live.com/embed?cid=DFF1B4D9CD55ADCA&resid=DFF1B4D9CD55ADCA%2126211&authkey=' +
      inputValue +
      'vRhKe6BOaU&em=2';
    theFrame.src = completeUrl;
    theFrame.style.display = 'block';
  } else {
    theFrame.style.display = 'none';
  }
}

function triggerWaypoint(logEventInHeap) {
  var waypoint = new Waypoint({
    element: document.getElementById('waypoint-element'),
    handler: function() {
      if (logEventInHeap) {
        heap.track('Read To End', { post: window.location.pathname });
      } else {
        alert('Event Logged' + window.location.pathname);
      }

      this.destroy();
    }
  });
}

// Render Subscribe Newsletter.
$(document).ready(function() {
  $('#subscribeNewsletter').click(function(e) {
    e.preventDefault();
    $('#subscribeNewsletterModal').modal('show');
    createCookie('newsletterReminder', 'true', 20);
    return;
  });
  $('#subscribeFooterLink').click(function(e) {
    e.preventDefault();
    $('#subscribeNewsletterModal').modal('show');
    createCookie('newsletterReminder', 'true', 20);
    return;
  });
  $('a').click(function(e) {
    var fragment = this.href.split('#')[1] || '';
    if (fragment === 'subscribe') {
      e.preventDefault();
      $('#subscribeNewsletterModal').modal('show');
      createCookie('newsletterReminder', 'true', 20);
    }
    return;
  });
  var subscribeFragment = window.location.hash.substr(1);
  if (subscribeFragment === 'subscribe') {
    $('#subscribeNewsletterModal').modal('show');
    createCookie('newsletterReminder', 'true', 20);
  }
});

$(document).ready(function() {
  $('#search').submit(function(event) {
    var searchBox = $('[name="q"]');
    if (searchBox.val().trim() === '') {
      $('#search').addClass('has-error');
      event.preventDefault();
    } else {
      $('#search').removeClass('error');
      return;
    }
  });
});

function drawChart(chartArray) {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(onLoadComplete);

  function onLoadComplete() {
    var data = google.visualization.arrayToDataTable(chartArray);
    var options = { pieHole: 0.4, legend: 'none' };
    var chart = new google.visualization.PieChart(
      document.getElementById('categoryChart')
    );
    chart.draw(data, options);
    google.visualization.events.addListener(
      chart,
      'select',
      onCategorySelected
    );
    function onCategorySelected() {
      var selection = chart.getSelection();
      for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        if (item.row != null) {
          var categoryTag = data.getFormattedValue(item.row, 0);
          window.location.href = '/categories/' + categoryTag;
        }
      }
    }
  }
}

// Cookie functions
function createCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toGMTString();
  }

  document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name) {
  var nameEq = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEq) === 0) {
      return c.substring(nameEq.length, c.length);
    }
  }

  return null;
}

function eraseCookie(name) {
  createCookie(name, '', -1);
}
// Cookie Functions End

$(document).ready(function() {
  setTimeout(cookieReminder, 60000);
  function cookieReminder() {
    var visited = readCookie('newsletterReminder');
    if (!visited || visited !== 'true') {
      createCookie('newsletterReminder', 'true', 20);
      $('#subscribeNewsletterModal').modal('show');
    }
  }
});

// One Signal Init
$(document).ready(function() {
  var oneSignal = window.OneSignal || [];
  oneSignal.push([
    'init',
    {
      appId: '379ca296-faf2-4bb1-ad04-ad7bbae04b31',
      safari_web_id: 'web.onesignal.auto.5d6ab6d2-4d0b-4ad8-b336-7f8ff3aff850',
      autoRegister: false,
      welcomeNotification: {
        title: 'Welcome to The Cloud Blog',
        message: 'Thank you for subscribing!'
        // "url": ""
      },
      notifyButton: {
        enable: true,
        size: 'medium',
        theme: 'default',
        position: 'bottom-left',
        prenotify: true,
        showCredit: false,
        offset: {
          bottom: '18px',
          left: '65px',
          right: '0px'
        },
        colors: {
          'circle.background': '#CC4444',
          'circle.foreground': 'white'
        }
      }
    }
  ]);
});

// Disqus Content Oraganizer.
$(document).ready(function() {
  $('#btnOrganizeDisqusContent').click(function(e) {
    var expandText = 'All Comments';
    var contractText = 'Few Comments';
    e.preventDefault();
    if (this.innerText === expandText) {
      $('#disqusCommentBoxOverlay').css({ height: 'auto' });
      this.innerText = contractText;
      return;
    }
    if (this.innerText === contractText) {
      $('#disqusCommentBoxOverlay').css({ height: '50vh' });
      this.innerText = expandText;
      return;
    }
  });
});

// Apply targeted stylesheets.
$(document).ready(function() {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('/post/') >= 0) {
    $('head').append(
      '<link rel="stylesheet" href="/css/posts_style.css?v1" type="text/css" />'
    );
    return;
  }
});
