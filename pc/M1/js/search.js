
var MAX_RECORD = 50;

var MAX_PAGER_COUNT = 10;

var STR_SEARCH_WORD = "Keyword";
var STR_HITS = " Hits";
var STR_PREV = "&lt;&lt;";
var STR_NEXT = "&gt;&gt;";

var _nowPage = 0;

var _hitObj = new Array;
var _ttlObj = new Array;

function search()
{
    var searchWord = $("#searchbox").val();
    var urlWord = encodeURIComponent(searchWord);
    parent.content.document.location = "search.html?sw=" + urlWord;
}

function getQueryString()
{
    var result = {};
    if (1 < window.location.search.length) {
        var query = window.location.search.substring(1);
        var parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);
            result[paramName] = paramValue;
        }
    }
    return result;
}

function searchLoaded()
{
    var getQuery = getQueryString();
    var sw = "";
    var page = "";
    var hasPage = false;

    try {
        var searchwordQuery = getQuery["sw"];
        if (searchwordQuery) {
            sw = searchwordQuery;
        }
        else
        {
            sw = "";
        }

        var pageQuery = getQuery["p"];
        if (pageQuery) {
            page = pageQuery;
            hasPage = true;
        }
    }
    catch (ex) {
        sw = "";
    }

    if (hasPage)
    {
        searchWordWithPage(sw, page);
    }
    else
    {
        searchWord(sw);
    }
}

function addColor(searchWord, sieRef)
{
    var hitObjForColor = getHitObjListForColor(searchWord, sieRef);

    var i;
    for (i = 0; i < hitObjForColor.List.length; i++)
    {
        addColorFromId(hitObjForColor.List[i].TagId, searchWord);
    }
}

function addColorFromId(id,searchWord)
{
	if(document.all(id))
	{
		var idContent = document.all(id).innerHTML;
		var colorContent = GetContenWithColor(idContent,searchWord);
		document.all(id).innerHTML = colorContent;
	}
}

function viewLoaded()
{
    var getQuery = getQueryString();
    var searchWord = "";
    var hasSearchWord = false;
    var topicId = "";
    var topicFile = "";

    try
    {
        var searchwordQuery = getQuery["sw"];
        if (searchwordQuery)
        {
            hasSearchWord = true;
            searchWord = searchwordQuery;
        }
    }
    catch(ex)
    {
        topicId = "";
        topicFile = "";
        searchWord = "";
    }

    if (hasSearchWord)
    {
        addColor(searchWord, topicFile);
    }
}

function movePage(page)
{
	if(_hitObj.List)
	{
		if(page >= 0 && page < _hitObj.PageCount)
		{
		    document.location = "search.html?sw=" + encodeURIComponent(_hitObj.SearchWord) + "&p=" + page;
		}
	}
}

function prevButtonClick()
{
	if(_nowPage != 0)
	{
		_nowPage--;
		document.location = "search.html?sw=" + encodeURIComponent(_hitObj.SearchWord) + "&p=" + _nowPage;
	}
}

function nextButtonClick()
{
	if(_hitObj.List)
	{
		if( _nowPage + 1 < _hitObj.PageCount )
		{
			_nowPage++;
			document.location = "search.html?sw=" + encodeURIComponent(_hitObj.SearchWord) + "&p=" + _nowPage;
		}
	}
	
}

function review()
{
	if(_hitObj.List)
	{
		if(_hitObj.List.length != 0)
		{
			var viewObj = getViewObj(_hitObj,_nowPage);
			viewSearchResult(viewObj);
		}
	}
}

function searchWord(sw)
{
	_hitObj = getHitObjList(sw);
	_nowPage = 0;

	var viewObj = getViewObj(_hitObj,_nowPage);

	viewSearchResult(viewObj);
}

function searchWordWithPage(searchWord,page)
{
    _hitObj = getHitObjList(searchWord);
    _nowPage = Number(page);

    var viewObj = getViewObj(_hitObj, _nowPage);

    viewSearchResult(viewObj);
}

function viewSearchResult(viewObj)
{
	var pagerContent = getPagerContent(viewObj);
	var viewCount = viewObj.List.length
	var content = "";
	var ttl = gst();
	
    content += getSearchResultHeder(viewObj);
	if (viewObj.List.length > 0) {
 	    content += pagerContent;
    }
	content += "<div class='search-result-group'>";
	for(i = 0; i < viewCount;i++)
	{
	    var sieHtml = viewObj.List[i].SieRef;

	    content += "<div class='searchContainer'>";

	    content += "<div class=\"searchResultPath\">";
	    content += ttl[sieHtml].SiePath;
	    content += "</div>";
	    content += "<div class=\"searchResultItem\"><a href=\"#\" onclick=\"document.location.href='" + sieHtml + "?sw=" + encodeURIComponent(viewObj.SearchWord) + "'; return false;\">";
	    content += ttl[sieHtml].SieTitle;
	    content += "</a>";
	    content += "</div>";

	    //content += "<p>";
	    //content += viewObj.List[i].Shortdesc;
	    //content += "</p>";

	    content += "</div>";
	}
	content += "</div>";

	if (viewObj.List.length > 0) {
 	    content += pagerContent;
    }
	document.all("main").innerHTML = content;
	document.all("main").style.display = "";
}

function getSearchResultHeder(viewObj)
{
    var contentTop = "<p class='searchResultsHeader'>" + STR_SEARCH_WORD + "： <b>{0}</b>    {1} " + STR_HITS + " {2}-{3}</p>";
	
	contentTop = contentTop.replace("{0}", viewObj.SearchWord);
	contentTop = contentTop.replace("{1}", viewObj.HitCount);
	contentTop = contentTop.replace("{2}", viewObj.ItemNoStart + 1);
	contentTop = contentTop.replace("{3}", viewObj.ItemNoEnd + 1);
	
	return contentTop;
}

function getPagerContent(viewObj)
{
    var content = "";
    content += "<div class=\"searchPager\">";
    content += "<ul class=\"searchPagerNo\">";
	content += getButtonPrevPage();
	content += getPager(viewObj);
	content += getButtonNextPage(viewObj);
	content += "</ul>";
	content += "</div>";
	return content;
}

function getPager(viewObj)
{
	var result = "";

	var startIndex;
	var endIndex;

	if(viewObj.PageCount <= MAX_PAGER_COUNT)
	{
		startIndex = 0;
		endIndex = viewObj.PageCount;
	}
	else
	{
		startIndex = _nowPage - Math.floor(MAX_PAGER_COUNT / 2);
		if(startIndex < 0)
		{
			startIndex = 0;
		}
		
		endIndex = startIndex + MAX_PAGER_COUNT;
		if(endIndex > viewObj.PageCount)
		{
			endIndex = viewObj.PageCount;
			startIndex = endIndex - MAX_PAGER_COUNT;
		}
	}

	var i;
	for( i = startIndex; i < endIndex; i++)
	{
		var viewPage = i + 1;
		
		if (i == _nowPage)
		{
		    result += "<li><a class=\"viewing\" href=\"javascript:movePage(" + i + ");\">" + viewPage + "</a></li>";
		}
		else
		{
		    result += "<li><a class=\"unviewing\" href=\"javascript:movePage(" + i + ");\">" + viewPage + "</a></li>";
		}
	}
	
	return result;
}

function getButtonNextPage(viewObj)
{
	var result = "";

	if(_nowPage + 1 < viewObj.PageCount)
	{
	    result += "<li class=\"searchPagerNext changePageActive\">";
	    result += "<a href=\"javascript:nextButtonClick();\">" + STR_NEXT + "</a>";
	    result += "</li>";
	}
	else
	{
	    result += "<li class=\"searchPagerNext changePageNotActive\">";
	    result += "<a href=\"javascript: ;\">" + STR_NEXT + "</a>";
	    result += "</li>";
	}
	
	return result;
}

function getButtonPrevPage()
{
	var result = "";
	
	if(_nowPage != 0)
	{
	    result += "<li class=\"searchPagerPrev changePageActive\">";
	    result += "<a href=\"javascript:prevButtonClick();\">" + STR_PREV + "</a>";
	    result += "</li>";
	}
	else
	{
	    result += "<li class=\"searchPagerPrev changePageNotActive\">";
	    result += "<a href=\"javascript: ;\">" + STR_PREV + "</a>";
	    result += "</li>";
	}
	
	return result;
}

function getViewObj(hitObj,nowPage)
{
	var viewObj = new Array;
	viewObj.List = new Array;
	viewObj.ItemNoStart = getItemCountStart(nowPage);
	viewObj.ItemNoEnd = getItemCountEnd(nowPage,hitObj.List);
	viewObj.SearchWord = hitObj.SearchWord;
	viewObj.PageCount = hitObj.PageCount
	viewObj.HitCount = hitObj.List.length;
	
	var viewObjCount = 0;
	for(i = viewObj.ItemNoStart; i<=viewObj.ItemNoEnd; i++)
	{
		viewObj.List[viewObjCount] = hitObj.List[i];
		viewObjCount++;
	}
	
	return viewObj;
}

function getItemCountStart(nowPage)
{
	return MAX_RECORD * nowPage;
}

function getItemCountEnd(nowPage, hitObjList)
{
	var result = 0;
	var itemNo = MAX_RECORD * (nowPage + 1) - 1;
	if(itemNo > hitObjList.length - 1){
		result = hitObjList.length - 1;
	}else{
		result = itemNo;
	}
	return result;
}

function getHitObjListForColor(searchWord,sieRef)
{
    var hitObjForColor = new Array;
    hitObjForColor.SearchWord = searchWord;
    hitObjForColor.List = new Array;

    var serchObjList = gsi();
    var hitCount = 0;

    for (i = 0; i < serchObjList.length; i++)
    {
        var serchObj = serchObjList[i];

        if (sieRef == serchObj.SieRef && isMatch(serchObj.Text, searchWord))
        {
            hitObjForColor.List[hitCount] = serchObj;
            hitCount++;
        }
    }

    return hitObjForColor;
}

function getHitObjList(searchWord)
{
	var hitObj = new Array;
	hitObj.SearchWord = searchWord;
	hitObj.List = new Array;

	var serchObjList = gsi();
	var hitCount = 0;
	
	var topicFileArray = {};

	for (i = 0; i < serchObjList.length; i++)
	{
	    if (isMatch(serchObjList[i].Text, searchWord))
	    {
	        if (!topicFileArray[serchObjList[i].SieRef])
	        {
	            hitObj.List[hitCount] = serchObjList[i];
	            hitCount++;

	            topicFileArray[serchObjList[i].SieRef] = 1;
	        }
	    }
	}
	
	hitObj.PageCount = Math.ceil(hitObj.List.length / MAX_RECORD);
	
	return hitObj;
}


