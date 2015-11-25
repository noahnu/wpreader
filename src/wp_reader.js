/*
	Written by Noah Negin-Ulster
	http://noahnu.com
	
	Icons made by Freepik from www.flaticon.com is licensed by http://creativecommons.org/licenses/by/3.0/"
*/

var WPReader = {
	init: function(){
		WPReader.wpBackdrop = $("<div id='wpreader-backdrop' title='Click To Exit'></div>");
		WPReader.wpContainer = $("<div id='wpreader-container'></div>");
		WPReader.wpScrollContainer = $("<div id='wpreader-scrollContainer'></div>");
		WPReader.wpView = $("<div id='wpreader-view' tabindex='-1'></div>");
		WPReader.wpViewSupTitle = $("<div id='wpreader-supTitle'><p class='wp-promptTitle'></p></div>");
		WPReader.wpViewTitle = $("<div id='wpreader-title'><p class='wp-title'><span class='wp-user'><a></a></span><span class='wp-score'></span><span class='wp-time'></span></p></div>");
		WPReader.wpNext = $("<a class='wp-next-link wp-noselect' id='wp-next-link'>Next</a>");
		WPReader.wpPrev = $("<a class='wp-prev-link wp-noselect' id='wp-prev-link'>Prev</a>");
		WPReader.wpViewText = $("<div id='wpreader-text'></div>");
		
		$('body').append(WPReader.wpBackdrop, [WPReader.wpContainer.append(WPReader.wpScrollContainer.append(WPReader.wpView.append(WPReader.wpViewSupTitle, [WPReader.wpViewTitle.append(WPReader.wpNext, [WPReader.wpPrev]), WPReader.wpViewText])))]);
		
		WPReader.wpEntryIDs = [];
		WPReader.currentThingID = -1;
		WPReader.promptTitle = $('#siteTable > div.thing > div.entry > p.title > a.title').text();
		
		WPReader.wpViewSupTitle.find('p.wp-promptTitle').html(WPReader.promptTitle);
		
		WPReader.scanEntries();
		WPReader.addEvents();
	},
	scanEntries: function(){
		$('div.commentarea > div.sitetable').children('div.comment').children('div.entry').each(function(){
			var linkA = $("<li><a class='open-wpreader'>open in WP Reader</a></li>");
			var thingID = $(this).parent().attr('data-fullname');
			WPReader.wpEntryIDs.push(thingID);
			linkA.find('a.open-wpreader').click(function(){WPReader.open(thingID)});
			$(this).find('.usertext').dblclick(function(){
				document.getSelection().removeAllRanges();
				WPReader.open(thingID)
			});
			$(this).find('ul.flat-list.buttons').append(linkA);
		});
		
		if(WPReader.wpEntryIDs.length > 0){
			WPReader.currentThingID = WPReader.wpEntryIDs[0];
		}
	},
	addEvents: function(){
		WPReader.wpBackdrop.click(function(){
			WPReader.close();
		});
		
		WPReader.wpNext.click(function(){
			WPReader.next();
		});

		WPReader.wpPrev.click(function(){
			WPReader.prev();
		});
		
		$(document).keydown(function(e){
			if(WPReader.wpBackdrop.is(':visible')){
				switch(e.which){
					case 37:
						WPReader.prev();
						break;
					case 39:
						WPReader.next();
						break;
					case 27:
						WPReader.close();
						break;
					default: return;
				}
			}
		});
		
		$(window).resize(function(){
			WPReader.wpView.height($(window).height());
			WPReader.wpView.scroll();
		});
		$(window).resize();

		$('body').bind('mousewheel', function(e) {
			if(WPReader.lockScroll) {
				WPReader.wpView.scrollTop(WPReader.wpView.scrollTop() - e.originalEvent.wheelDelta);
				return false;
			}
		});
		
		WPReader.wpView.scroll(function(){
		   WPReader.wpViewText.find('p').each(function () {
			  if (($(this).offset().top - $('body').scrollTop()) < $(window).height()) {
				  $(this).stop().fadeTo(200, 1);
			  }
		   });
		});
		
	},
	close: function(){
		if(WPReader.wpBackdrop.is(':visible')){
			WPReader.wpContainer.hide();
			WPReader.wpBackdrop.hide();
			$('body').css({'overflow-y' : 'auto'});
			WPReader.lockScroll = false;
			$('body').focus();
		}
	},
	open: function(thingID){
		WPReader.currentThingID = thingID;
		thing = $('div.thing.id-'+thingID);
		entry = thing.children('div.entry');
		if(thing.length > 0){
			var author = entry.find('p.tagline > a.author');
			var timeStamp = entry.find('p.tagline > time.live-timestamp').text();
			var score = entry.find('p.tagline > span.score.unvoted').text();
			var mdContainer = entry.children('form').find('div.usertext-body > div.md');
			if(mdContainer.length > 0){
				var content = WPReader.cleanText(mdContainer.html());
				
				content += WPReader.getParts(thing, author.text());
				content += "<p class='wp-footer'><br />Open source on <a href='https://github.com/noahnu/wpreader' target='_blank'>Github</a>. You can send me a message via my <a href='http://noahnu.com/contact' target='_blank'>website</a> or inbox me at <a target='_blank' href='http://www.reddit.com/message/compose/?to=noahnu'>/u/noahnu</a>.<br /><br /></p>";
				
				if(WPReader.wpContainer.is(':visible')){
					WPReader.wpViewText.hide();
				}
				WPReader.wpViewText.html(content);
				if(WPReader.wpContainer.is(':visible')){
					WPReader.wpViewText.fadeIn();
				}
				
				WPReader.wpViewTitle.find('p.wp-title > span.wp-user > a').html(author.text());
				WPReader.wpViewTitle.find('p.wp-title > span.wp-user > a').attr('href', author.attr('href'));
				WPReader.wpViewTitle.find('p.wp-title > span.wp-time').text(timeStamp);
				WPReader.wpViewTitle.find('p.wp-title > span.wp-score').text(score);
				WPReader.wpContainer.css('top', ($(window).scrollTop())+'px');
				if(!WPReader.wpBackdrop.is(':visible')){
					WPReader.wpBackdrop.fadeIn();
				}
				if(!WPReader.wpContainer.is(':visible')){
					WPReader.wpContainer.fadeIn();
					$('body').css({'overflow-y' : 'hidden'});
					WPReader.lockScroll = true;
					WPReader.wpView.focus();
				}
			}
			
			WPReader.wpViewText.find('p').each(function(){
				if (($(this).offset().top - $('body').scrollTop() + 50) > $(window).height()) {
				  $(this).stop().fadeTo(1, 0.25);
				}
			});
		}
	},
	next: function(){
		var currIndex = WPReader.wpEntryIDs.indexOf(WPReader.currentThingID);
		if(currIndex > -1){
			if(currIndex + 1 < WPReader.wpEntryIDs.length){
				WPReader.open(WPReader.wpEntryIDs[currIndex+1]);
			}
		}
	},
	prev: function(){
		var currIndex = WPReader.wpEntryIDs.indexOf(WPReader.currentThingID);
		if(currIndex > -1){
			if(currIndex - 1 > -1){
				WPReader.open(WPReader.wpEntryIDs[currIndex-1]);
			}
		}
	},
	cleanText: function(text){
		return text;
	},
	getParts: function(currRoot, author){
		longestLength = 0;
		childEntries = currRoot.children('div.child').children('div.sitetable').children('div.comment').children('div.entry').filter(function(){
			if($(this).children('p.tagline').children('a.author').text() == author){
				//Lengthy comments by author are most likely parts.
				var cont = $(this).children('form').children('div.usertext-body').children('div.md').html();
				if(cont.length > longestLength){
					longestLength = cont.length;
					return true;
				} else { return false; }
			} else { return false; }
		});
		
		if(childEntries.length == 0){
			return "";
		} else {
			return "<p class='wp-continued'>WP Reader: Another part detected...</p>" + childEntries.children('form').children('div.usertext-body').children('div.md').html() + WPReader.getParts(childEntries.parent(), author);
		}
	}
};

if(document.URL.toLowerCase().indexOf("/r/writingprompts/") > -1){	
	WPReader.init();
}