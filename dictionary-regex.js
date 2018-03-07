var letterValues = new Array();
letterValues['wwf'] = { 
		'a' : 1, 'b' : 4, 'c' : 4, 'd' : 2, 'e' : 1, 'f' : 4, 
		'g' : 3, 'h' : 3, 'i' : 1, 'j' : 10, 'k' : 5, 'l' : 2, 
		'm' : 4, 'n' : 2, 'o' : 1, 'p' : 4, 'q' : 10, 'r' : 1, 
		's' : 1, 't' : 1, 'u' : 2, 'v' : 5, 'w' : 4, 'x' : 8, 
		'y' : 3, 'z' : 10, '?' : 0 };
letterValues['wftwl'] = letterValues['wfsowpods'] = {
		'a' : 1, 'b' : 4, 'c' : 4, 'd' : 2, 'e' : 1, 'f' : 4, 
		'g' : 3, 'h' : 4, 'i' : 1, 'j' : 10, 'k' : 5, 'l' : 1, 
		'm' : 3, 'n' : 1, 'o' : 1, 'p' : 4, 'q' : 10, 'r' : 1, 
		's' : 1, 't' : 1, 'u' : 2, 'v' : 4, 'w' : 4, 'x' : 8, 
		'y' : 4, 'z' : 10, '?' : 0 };
var loaded = false;
var dict = "";
var dictName = "";
var tabs = new List();
var sort = new Sort();

function Sort() {
	this.id = "word";
	this.asc = true;
}

function List() {
    this.items = new Array();
    this.count = this.items.length;
    this.getItem = getItem;
    this.setItem = setItem;
    this.addItem = addItem;
    this.removeItem = removeItem;
    this.countItem = countItem;
    this.sort = sortItems;
}
function addItem(item) {
	this.items.push(item);
	this.count = this.items.length;
}
function removeItem(item) {
	var index = this.items.indexOf(item);
	if (index != -1) {
		this.items.splice(index, 1);
		this.count = this.items.length;
		return true;
	}
	return false;
}
function getItem(index) {
	return this.items[index];
}
function setItem(index, item) {
	this.items[index] = item;
	this.count = this.items.length;
}
function countItem(item) {
	var found = 0;
	var index = this.items.indexOf(item);
	while (index != -1) {
		index = this.items.indexOf(item, index + 1);
		found++;
	}
	return found;
}
function sortItems(sortFunc) {
	this.items.sort(sortFunc);
}

function Matcher(availLetters, matchPattern) {
	this.availLetters = availLetters;
	this.matchPattern = matchPattern;
	this.buildRegex = buildRegex;
	this.getAvailList = getAvailList;
	this.getNeedList = getNeedList;
	this.canMatch = canMatch;
	this.getMatches = getMatches;
}
function buildRegex(isGlobal, matchChars) {
	var text = "";
	if (matchChars == undefined) {
		text = this.matchPattern.replace(/\?/g, "(\\w)");
		text = text.replace(/\*/g, "(\\w*)");
	} else {
		var matchLength = "]{0," + matchChars.length + "}";
		matchChars = matchChars.replace(/\?/g, "\\w");
		text = this.matchPattern.replace(/\?/g, "([" + matchChars + "])");
		text = text.replace(/\*/g, "([" + matchChars + matchLength + ")");
	}
	text = "^" + text + "$";
	var mods = isGlobal ? "igm" : "im";
	return new RegExp(text, mods);
}
function getAvailList() {
	var availList = new List();
	for (var i = 0; i < this.availLetters.length; i++) {
		availList.addItem(this.availLetters.charAt(i));
	}
	return availList;
}
function getNeedList(word) {
	var pattern = this.buildRegex(false);
	var match = word.match(pattern);
	var needList = new List();
	for (var i = 1; i < match.length; i++) {
		for (var j = 0; j < match[i].length; j++) {
			needList.addItem(match[i].charAt(j));
		}
	}
	return needList;
}
function canMatch(word) {
	// Check if a word is being matched
	if (!word) {
		return { canMatch : false, usedLetter : new List() };
	}
	
	// Build the available letters list and the needed letters list
	var availLetters = this.getAvailList();
	var neededLetters = this.getNeedList(word.toLowerCase());
	
	// Ensure the needed letters can be built from the available letters
	var canMatch = true;
	var usedLetters = new List();
	for (i in neededLetters.items) {
		if (availLetters.removeItem(neededLetters.items[i])) {
			usedLetters.addItem(neededLetters.items[i]);
		} else if (availLetters.removeItem("?")) {
			usedLetters.addItem("?");
		} else {
			canMatch = false;
		}
	}
	return { canMatch : canMatch, usedLetters : usedLetters };
}
function getMatches() {
	var list = new List();
	if (!this.matchPattern) {
		return list;
	}
	var pattern = this.buildRegex(true, this.availLetters);
	var matches = dict.match(pattern);
	for (i in matches) {
		var match = matches[i];
		var canMatch = this.canMatch(match);
		if (canMatch.canMatch) {
			list.addItem(new Word(match, canMatch.usedLetters));
		}
	}
	return list;
}

function Word(word, usedLetters) {
	this.getLetterValue = getLetterValue;
	this.getUsedLettersString = getUsedLettersString;
	this.getUsedLettersValue = getUsedLettersValue;
	this.getWordValue = getWordValue;
	this.word = word;
	this.wordLength = this.word.length;
	this.wordValue = this.getWordValue();
	this.usedLetters = usedLetters;
	this.usedLettersLength = this.usedLetters.count;
	this.usedLettersValue = this.getUsedLettersValue();
	this.usedLettersString = this.getUsedLettersString();
}
function getWordValue() {
	var sum = 0;
	for (var i = 0; i < this.word.length; i++) {
		sum += this.getLetterValue(this.word.charAt(i));
	}
	return sum;
}
function getUsedLettersValue() {
	var sum = 0;
	for (i in this.usedLetters.items) {
		sum += this.getLetterValue(this.usedLetters.items[i]);
	}
	return sum;
}
function getUsedLettersString() {
	var string = "";
	for (i in this.usedLetters.items) {
		string += this.usedLetters.items[i];
	}
	return string;
}
function getLetterValue(letter) {
	letter = letter.toLowerCase();
	return letterValues[dictName][letter];
}

$(document).ready(function() {
	$(".initialFocus").focus();
	var dictOptions = $("input[name='dictionary']");
	dictOptions.click(function () {
		loadDict($(this));
	});
	dictOptions.attr("checked", false);
	dictOptions.first().click();
	if (dictOptions.length == 1) {
		$("#dictOptionsRow").hide();
	}
});
function loadDict(radio) {
	var label = $("label[for='" + radio.attr("id") + "']");
	var url = radio.val();
	var slashIndex = url.lastIndexOf("/") + 1;
	var dotIndex = url.lastIndexOf(".");
	loaded = false;
	dict = "";
	dictName = url.substring(slashIndex, dotIndex).toLowerCase();
	$("#dictLabel").html(label.text());
	$("#dictStatus").html("Loading...");
	$.ajax({
		url: url,
		success: function(data) {
			$("#dictStatus").html("Loaded!");
			dict = data;
			loaded = true;
			showWords();
		}
	});
}
function showWords() {
	if (loaded) {
		$("#matches").html("Loading...");
		setTimeout(function() {
			var matcher = new Matcher($("#availLetters").val().toLowerCase(), $("#matchPattern").val());
			var matches = matcher.getMatches();
			var count = 0;
			tabs.setItem(count, matches);
			displayMatches(count);
		}, 1);
	} else {
		alert("Please wait for the dictionary to load.");
	}
}
function sortHeader(id) {
	if (sort.id == id && sort.asc) {
		sort.asc = false;
	} else {
		sort.asc = true;
	}
	sort.id = id;
	displayMatches(0);
}
function sortMatches(matches) {
	matches.sort(function(wordA, wordB) {
		var compare = 0;
		if (wordA[sort.id] < wordB[sort.id]) {
			compare = -1;
		} else if (wordA[sort.id] > wordB[sort.id]) {
			compare = 1;
		}
		return sort.asc ? compare : 0 - compare;
	});
}
function displayHeader(header, id) {
	var html = "<a href=\"javascript:sortHeader('" + id + "')\" class=\"link\">" + header;
	if (sort.id == id) {
		html += ((sort.asc) ? " &uarr;" : " &darr;");
	}
	html += "</a>";
	return html;
}
function displayMatches(index) {
	var matches = tabs.getItem(index);
	sortMatches(matches);
	var matchesHTML = "";
	if (matches.count > 0) {
		matchesHTML = "<br /><table>";
		matchesHTML += "<tr>";
		matchesHTML += "<th width='50%'>" + displayHeader("Word", "word") + " (" + displayHeader("Score", "wordValue") + "* / " + displayHeader("Length", "wordLength") + ")</th>";
		matchesHTML += "<th width='50%'>" + displayHeader("Letters Used", "usedLettersString") + " (" + displayHeader("Score", "usedLettersValue") + " / " + displayHeader("Count", "usedLettersLength") + ")</th>";
		matchesHTML += "</tr>";
		for (var i = 0; i < matches.count; i++) {
			var match = matches.items[i];
			matchesHTML += "<tr>";
			matchesHTML += "<td>" + match.word.toLowerCase() + " (" + match.wordValue + " / " + match.wordLength + ")</td>";
			matchesHTML += "<td>" + match.usedLettersString.toLowerCase() + " (" + match.usedLettersValue + " / " + match.usedLettersLength + ")</td>";
			matchesHTML += "</tr>";
		}
		matchesHTML += "</table>";
	} else {
		matchesHTML = "<i>No matches found</i>";
	}
	$("#matches").html(matchesHTML);
	if (matches.count > 0) {
		$("html, body").animate({
			scrollTop: $("#matches").offset().top
		}, "fast");
	}
}