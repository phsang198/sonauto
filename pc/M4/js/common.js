var _regObject;

function print()
{
	parent.content.printOne();
}

function printGroup()
{
	parent.content.printGroup();
}

function enlarge(illustid)
{
	var	new_win
	
	new_win = window.open("", illustid);
	new_win.document.open();
	new_win.document.write("<!DOCTYPE html><html><body><p>");
	new_win.document.write("<form>");
	new_win.document.write("<input type='button' value='CLOSE' name='btn_close' onclick='javascript:top.close()'/>")
	new_win.document.write("</form>");
	new_win.document.write("<hr/><object type='image/svg+xml' data='../img/" + illustid + ".svg' width='800'></object></p>");
	new_win.document.write("</body></html>");
	new_win.document.close();
}

function enlargePdf(illustid)
{
    var href = "../pdf/" + illustid + ".pdf";
    window.open(href, illustid);
}

function gsitm(sieRef, text, shortdesc, tagId) {
    var data = new Array;
    data.SieRef = sieRef;
    data.Text = text;
    data.TagId = tagId;
    return data;
}

function gsttl(siePath, sieTitle) {
    var data = new Array;

    data.SiePath = siePath;
    data.SieTitle = sieTitle;
    
    return data;
}

function isMatch(innerText, strKey)
{
    var regExp = getRegExp(strKey);
    return regExp.test(innerText);
}

function getContenWithColor(innerXml, strKey)
{
    if (strKey == "" || strKey == "*")
    {
        return innerXml;
    }

    var elementsWithTags = innerXml.split(/(<.+?>)/);
    var hitIndexArray = getHitIndexArray(innerXml, strKey);
    var stateSetStyle =
        getStateSetStyleMulti(elementsWithTags, hitIndexArray);

    var i;
    for (i = stateSetStyle.length - 1; i >= 0 ; i--)
    {
        var state = stateSetStyle[i];
        var content = elementsWithTags[state.ElementIndex];
        var contentBefor = content.substring(0, state.StringStartIndex);
        var HitContent = content.substring(state.StringStartIndex, state.StringEndIndex);
        var contentAfter = content.substring(state.StringEndIndex, content.length);
        var newContent =
            contentBefor +
            "<font style=\"background-color:#FFFF99;\">" +
            HitContent +
            "</font>" +
            contentAfter;

        elementsWithTags[state.ElementIndex] = newContent;
    }

    return getJoinText(elementsWithTags);
}

function getHitIndexArray(innerXml, strKey)
{
    var result = new Array();
    var resultArrayCounter = 0;

    var elements = innerXml.split(/<.+?>/);
    var innnerText = getJoinText(elements);
    var totalShift = 0;

    var i;
    while(true)
    {
        var regObject = getRegExp(strKey).exec(innnerText);

        if (regObject == null)
        {
            break;
        }

        var startIndex = regObject.index;
        var endIndex = startIndex + regObject[0].length;

        var item = new Array();
        item.StartIndex = startIndex + totalShift;
        item.EndIndex = endIndex + totalShift;
        result[resultArrayCounter] = item;
        resultArrayCounter++;

        innnerText = innnerText.substring(endIndex);
        totalShift += endIndex;
    }
    return result;
}

function getHitIndex(innerXml, strKey)
{
    var elements = innerXml.split(/<.+?>/);
    var innnerText = getJoinText(elements);
    var regObject = getRegExp(strKey).exec(innnerText);

    var startIndex = regObject.index;

    var endIndex = startIndex + regObject[0].length;

    var result = new Array();
    result.StartIndex = startIndex;
    result.EndIndex = endIndex;

    return result;
}

function getStateSetStyleMulti(elementsWithTags, hitIndexArray)
{
    var result = new Array();

    var i;
    for(i = 0; i< hitIndexArray.length;i++)
    {
        var item = hitIndexArray[i];
        var stateSetStyle = getStateSetStyle(elementsWithTags, item.StartIndex, item.EndIndex);

        var j;
        for(j = 0;j<stateSetStyle.length;j++)
        {
            result.push(stateSetStyle[j]);
        }
    }

    return result;
}

function getStateSetStyle(elementsWithTags, startIndex, endIndex)
{
    var stateSetStyle = new Array();
    var stateSetStyleCounter = 0;
    var isHitting = false;
    var stringCounter = 0;
    var elementCounter = 0;
    var i;
    for (i = 0; i < elementsWithTags.length; i++) {
        var element = elementsWithTags[i];
        if ((! /<.+?>/.test(element)) && element != "") {
            if (isHitting) {
                stateSetStyle[stateSetStyleCounter] = new Array();
                stateSetStyle[stateSetStyleCounter].ElementIndex = elementCounter;
                stateSetStyle[stateSetStyleCounter].StringStartIndex = 0;
            }

            var j;
            for (j = 0; j < element.length; j++) {
                if (stringCounter == startIndex) {
                    stateSetStyle[stateSetStyleCounter] = new Array();
                    stateSetStyle[stateSetStyleCounter].ElementIndex = elementCounter;
                    stateSetStyle[stateSetStyleCounter].StringStartIndex = j;
                    isHitting = true;
                }

                if (stringCounter == endIndex - 1) {
                    stateSetStyle[stateSetStyleCounter].StringEndIndex = j + 1;
                    stateSetStyleCounter++;
                    isHitting = false;
                }

                stringCounter++;
            }

            if (isHitting) {
                stateSetStyle[stateSetStyleCounter].StringEndIndex = element.length;
                stateSetStyleCounter++;
            }
        }
        elementCounter++;
    }

    return stateSetStyle;
}

function getJoinText(elements)
{
    var result = "";

    var i;
    for(i = 0; i < elements.length; i++)
    {
        result += elements[i];
    }

    return result;
}

function getRegExp(strKey)
{
    if (_regObject && _regObject.Key)
    {
        if(strKey == _regObject.Key)
        {
            return _regObject.RegExp;
        }
    }

    _regObject = new Array;

    _regObject.Key = strKey;
    _regObject.RegExp = new RegExp(getPattern(strKey),"i");

    return _regObject.RegExp;
}

function getPattern(strKey)
{
    var result = strKey;

    result = result.replace("\\", "\\\\");
    result = result.replace("$", "\\$");
    result = result.replace("^", "\\^");
    result = result.replace("[", "\\[");
    result = result.replace("]", "\\]");
    result = result.replace(".", "\\.");
    result = result.replace("+", "\\+");
    result = result.replace("{", "\\{");
    result = result.replace("}", "\\}");

    result = result.replace("*", ".*");

    result = result.replace("?", ".");

    return result;
}
