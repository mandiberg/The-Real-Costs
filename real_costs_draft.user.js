// ==UserScript==
// @name			Real Costs
// @namespace		http://www.therealcosts.com
// @description		Adds Carbon Footprints to Airplane Travel and Car Directions Websites
// @version        	0.0.7.2
// @date           	2008-01-10
// @creator        	Michael Mandiberg (Michael [at] Mandiberg [dot] com)
// @include 		*
// ==/UserScript==
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
//
// --------------------------------------------------------------------


// XPI GUID is:  58fbeece-4b9a-4812-ab01-fe2a55b2df7c

/*

dev notes

please see the wiki for the dev notes

therealcosts.com/wiki

*/

//////	Begin check if the website is compatable

function timeFunction()
{
	var t=setTimeout(doMainFunction,10000);
}

(function () {
	
	//data for URL check. strip www from life URLs
	
	var href = window.location.host; 
	// window.location.host returns the hostname and port ie: www.something.com
	
	var path = window.location.pathname;
	// window.location.pathname returns all the info after the hostname and port ie: www.something.com/somefolder/somefile.html would return /somefolder/somefile.html 
	// (Also IDK if this is actually being used in this code)
	
	href = href.replace ("www.", "");
	//path = path.replace ("/", "");
	
	href_path = window.location;
	
	issValidURL = testIsValidURL(href);
	
	
	
	if(href == "google.com" && path == "/local"){
	//	alert(href);
		
		//href == maps.yahoo.com)
	//if(getHeaderIdCar(href) != 'notcar'){
		
	//}
	
	} else if (issValidURL == true) {	
		//alert(issValidURL);
		timeFunction();
	} else {
		
		
	}
})();

//////	End check for site compatability

//////	Begin main function

function doMainFunction(){
	//alert("Begin Main");
	carbon = 0;
	milesCar = 0;
	
	addGlobalStyle('.realcosts { color: #BC0000 ! important; }');
	addGlobalStyle("#rcWhole{display:none;}#containerHalf{display:block;}");
	addGlobalStyle(".offerwrap{display:none;important!}");
	
	//////	 Begin expand/contract code - this needs to be rebuilt w/ event listeners
	
	var expand = "function expand() {document.getElementById('rcWhole').style.display='block'; document.getElementById('containerHalf').style.display='none';document.cookie = 'realcostsExpand=expand; path=/';}";
	
	var contract = "function contract() {document.getElementById('containerHalf').style.display='block'; document.getElementById('rcWhole').style.display='none';document.cookie = 'realcostsExpand=contract; path=/';}";
	
	
	var contractCarbonInfo = "function contractCarbonInfo() { document.getElementById('carboninfo').style.display='none';}";
	
	var contractAllDivs = "function contractAllDivs() { document.getElementById('carboninfo').style.display='none';document.getElementById('businfo').style.display='none';document.getElementById('carpoolinfo').style.display='none';document.getElementById('bikeinfo').style.display='none';}";
	addScript(contractAllDivs);
	
	var expandCarbonInfo = "function expandCarbonInfo() { contractAllDivs(); document.getElementById('carboninfo').style.display='block';}";
	addScript(expandCarbonInfo);
	
	var expandBusInfo = "function expandBusInfo() { contractAllDivs(); document.getElementById('businfo').style.display='block';}";
	addScript(expandBusInfo);
	
	var expandCarpoolInfo = "function expandCarpoolInfo() { contractAllDivs(); document.getElementById('carpoolinfo').style.display='block';}";
	addScript(expandCarpoolInfo);
	
	var expandBikeInfo = "function expandBikeInfo() { contractAllDivs(); document.getElementById('bikeinfo').style.display='block';}";
	addScript(expandBikeInfo);
	
	//these should be combined into one function
	var expandCar = "function expandCar() {document.getElementById('selectCar').style.display='block';}";
	addScript(expandCar);
	
	var contractDiv = "function contractDiv() {alert(theDiv);document.getElementById('carboninfo').style.display='none';}";
	
	
	var contractDivVar = "function contractDivVar(theDiv) {alert(theDiv);document.getElementById('theDiv').style.display='none';}";
	
	// store 'mileage' in div/span. hiddenMiles get element value, parse int for 'car' and 'mileage'.  dividie and add into 'num'
	//carRate = 1/mpg * 23.6; // 23.6 lbs/gallon 
	
	var changeCarbon = "function changeCarbon() { carMpg = document.getElementById('car').innerHTML; thisTrip = document.getElementById('hiddenMiles').innerHTML; newCarbon = Math.ceil(10 * thisTrip * 1/carMpg * 23.6)/10; document.getElementById('num').innerHTML = newCarbon; document.getElementById('smallMpg').innerHTML = carMpg;}";
	addScript(changeCarbon);
	
	addScript(expand);
	addScript(contract);
	
	//////	End expand/contract code
	//////	Begin setup of regex/xpath
	
	// version needs to be changed for every major version change for pop up //
	version = '0.0.7.2';
	firstRun(version);
	getUnits();
	
	//const CodesRegex = /\b[A-Z][A-Z][A-Z]\b/g;
	const ChangeRegexCont = /Connect time/g;
	const ParenRegex = /\b\([A-Z][A-Z][A-Z]\)\b/g;
	const CodesRegex = /\b[A-Z][A-Z][A-Z]\b/g;
	const MilesRegex = /\d*,?\d+.?\d* ?miles?\b/ig;


	//data for URL check. strip www from life URLs
	var href = window.location.host;
	href = href.replace ("www.", "");

	codeFound = false;

	// tags we will scan looking for our data (airport codes, etc) to calculate impact data
	var allowedParents = [
		"a", "abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body", 
		"caption", "center", "cite", "code", "dd", "del", "div", "dfn", "dt", "em", 
		"fieldset", "font", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
		"ins", "kdb", "li", "object", "pre", "p", "q", "samp", "small", "span", "strike", 
		"s", "strong", "sub", "sup", "table", "td", "th", "tt", "u", "var"
		];
   
	var xpath = "//text()[(parent::" + allowedParents.join(" or parent::") + ")" +
				//" and contains(translate(., 'HTTP', 'http'), 'http')" + 
				"]";

	var candidates = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);



	//declaration of global variables -- initial states
	originFound = new Boolean(false);
	justCarbon = 0;
	destinCounter = 0;
	firstDestin = "";
	secondDestin = "";
	onlyOneDestin = "";
	GM_setValue("justCarbon", justCarbon);
	gmOrigin = 'start';
	GM_setValue("gmOrigin", gmOrigin);
	gmDestin = 'start';
	GM_setValue("gmDestin", gmDestin);
	bumpcounter = false;
	
	//////	End setup of regex/xpath
	
	// script will branch here and deal w/ the diff typs of calculations
	//////	Begin air travel section
	
	if(getHeaderId(href) != 'notair'){
	
		//////	Begin to do the air calcs
		
		for (var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++) {
			// begin airplane mileage tracking
			if ( ParenRegex.test(cand.nodeValue)) {  // is this code junk?
		 
			}// is this code junk?
			if (CodesRegex.test(cand.nodeValue)) {
				var span = document.createElement("span");
				var source = cand.nodeValue;
				cand.parentNode.replaceChild(span, cand);
				  
				if (ChangeRegexCont.test(source)) {
					bumpcounter = true;
				}
				CodesRegex.lastIndex = 0;
				for (var match = null, lastLastIndex = 0; (match = CodesRegex.exec(source)); ) {
					//puts everything before the regex'd value back into the span
					span.appendChild(document.createTextNode(source.substring(lastLastIndex, match.index)));
					 // puts the regex'd value back into the span
					var a = document.createElement("span");
					a.appendChild(document.createTextNode(match[0]));
					span.appendChild(a);
					var code = match[0];
				   
					if (getAirportLoc(code) &&     bumpcounter == false){
						originFound = doAir(originFound, code, span, href);
						codeFound = true;
						if(GM_getValue("justCarbon") == 1){
							CodesRegex.lastIndex++;
							justCarbon = 0;
							GM_setValue("justCarbon", justCarbon);
						}
					}
					bumpcounter = false;
	
					lastLastIndex = CodesRegex.lastIndex;
				}
				//puts everything after the regex'd value back into the span
				span.appendChild(document.createTextNode(source.substring(lastLastIndex)));
				span.normalize();
			}
		//////	End air calcs
		}
   
		////// 	Begin add header block
		//////	Begin add header for air
		if(codeFound == true){
			addHeader(href);
		}
		
		//////	End add header for air
	
		} else if(getHeaderIdCar(href) != 'notcar'){ // new loop for car directions
			// write function look up origCarId origDestinId by href  getCarOrig(href);
			// getElementByID etc for the origCarId
			
			// variable called carOrig and carDestin
			lbspergallon = 23.6; // 19.0 for driving, plus 4.6 upstream in refining process (http://www.google.org/recharge/dashboard/calculator#note)
			//mycar = readCookie("car");
			if(mycarString = GM_getValue("comb")){
		//		alert('there is a cookie.  Combined mpg: ' +mycarString);
				mpg = parseInt(mycarString);
				cookieSet = true;
			}else{
		//		alert('no cookie');
				mpg = 24.7;  // average car + truck mpg from http://www.nhtsa.dot.gov/Cars/rules/CAFE/docs/Summary-Fuel-Economy-Pref-2004.pdf
				cookieSet = false;
				
			}
			
			//mycarStringFull = readCookie("carCookieFull");
			//carArray = mycarString.split("#");
			//alert(carArray[0]);
			
			
			//mpg = 33.3; //this will change
			gpm = 1/mpg;
			carRate = gpm * lbspergallon
			
			//begin doing the loop to check for inline values
			for (var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++) {
				// begin airplane mileage tracking
				if ( ParenRegex.test(cand.nodeValue)) {  // is this code junk?
		
				}// is this code junk?
				
				if (MilesRegex.test(cand.nodeValue)) {
					var span = document.createElement("span");
					var source = cand.nodeValue;
					cand.parentNode.replaceChild(span, cand);
		
					if (ChangeRegexCont.test(source)) {
						bumpcounter = true;
					}
					
					MilesRegex.lastIndex = 0;
					for (var match = null, lastLastIndex = 0; (match = MilesRegex.exec(source)); ) {
						//puts everything before the regex'd value back into the span
						span.appendChild(document.createTextNode(source.substring(lastLastIndex, match.index)));
						 // puts the regex'd value back into the span
						var a = document.createElement("span");
						a.appendChild(document.createTextNode(match[0]));
						
						if (codeFound == false || match[0] == matchOne){
							codeFound = true;
							matchOne = match[0];
							strippedMatch = match[0].split(" ");
							milesCar = parseInt(strippedMatch[0]);
							carbon = Math.ceil(10 * milesCar * carRate)/10;
						//	a = document.createElement("br");
							a.appendChild(document.createTextNode(' (' + carbon +'Lbs CO2)'));
						}
						span.appendChild(a);
						var code = match[0];
						//bumpcounter = false;
	
						lastLastIndex = MilesRegex.lastIndex;
					}
				//puts everything after the regex'd value back into the span
				span.appendChild(document.createTextNode(source.substring(lastLastIndex)));
				span.normalize();
			}
	
		}    //end doing the loop to check for inline values
			
		if(milesCar != 0){
			//alert('erroryet?');
			addHeaderCar(href, carbon, milesCar, cookieSet);
		}		
	}
	//////	End Insert Header Block
	
} 

//////	End doMainFunction



/////////////////////////////////////////////////////////////////////////

// 	BEGIN FUNCTIONS, END MAIN SCRIPT

/////////////////////////////////////////////////////////////////////////




// chunk of code for testing -- outputs variables at hte top of the page

/*var logo = document.createElement("div");
logo.innerHTML = '<div style="margin: 0 auto 0 auto; ' +
    'border-bottom: 1px solid #000000; margin-bottom: 5px; ' +
    'font-size: small; background-color: #ffffff; ' +
    'color: #000000;"><p style="margin: 2px 0 1px 0;"> ' +
    ' ' + origin + ' ' + destin + ' ' + carbon
    '</p></div>';
document.body.insertBefore(logo, document.body.firstChild);
*/
// end test code

//////	Begin code to generate header
function addHeader(href){

	//////	Begin calcs for the Header
	
	origin = GM_getValue("gmOrigin");
	destinLast = GM_getValue("gmDestin");
	if(href == "expedia.com"){
		origin = destin0;
		destin = destin1;
	} else if(href == "continental.com"){
		origin = destin0;
		destin = destin1;
	} else if(destin2 != destin0 && destin2 != destin1){
		destin = destin1;
	} else if(destin0 == destin3 && destin1 == destin2){
		destin = destin2;
	} else if(destin0 == destin2){
		destin = destin3;	
	} else if(destin1 == destin2 && destin0 != destin3){
		destin = destin3;
	} else {
		destin = destin1;
	}

	airFactor = 1.36;
	driveFactor = .971; //lbs CO2e/mi
	busFactor = .05;
	trainFactor = .12;  
	tonnes = 2204; //  lbs/tonne
	divisionFactor = 150/12500; // pixels / total lbs in scale

	units = GM_getValue('units');
	if (units == "usa"){
		distFactor = 1;
		massFactor = 1*tonnes;
		distUnits = "miles";
		massUnits = "lbs";
		divisionFactorFixed = 150/12500; // for the fixed values -- for some reason is f'd up
	    scale = 'data:image/gif;base64,R0lGODlhPwCcAMQAANzm674QEc6DhtOkqMMxMsVCQ8piZcdSVMEhItnV2tCUl9fFysxzduT4/NW0ueX4/eT4/eT3/MQyM+Hn7P+cIf+cIuHn68dCQ8QxMt/X28xjZdzGyt/X2sQyMrwAAN72/CH5BAAAAAAALAAAAAA/AJwAAAX/YEWJEfSU5aeubOu+cPxS1POYUQOlcu//rUqjYcvpeMCkskWBDCM2XGNJXdpujQlCMswUPJ4C4OMAgxefQSA8/gjAhmrs8dxIPFzIxbNYeOJvDisAAQaEcQMeCokKci8NJRYeCB4dUBArAQgfBwEsCoofBZ4GHgkfAQeOLjtZFxweGCdTH6AFH5RgAm4eA5weAF9jAQSrLTo4E3jIabq4t6UDDL2/AATAqMXGK3RGylxEC2u3LGUMb74HwMLZ2yuQThGSshBaHgRtK+agvgSkwAA8qHL34QadB5Ik5NAwqU0ZaHwIHTjUTAAjgi4CaltjxpOCNQEapRnX5s0fjChT/6pcmeRNAg+7ZAQDM9BkgF0LKCE4hdIlzB4F8PkRUGYXKAcHEBBikNLnmp2gPARA8yFgTBUGPKlAEKdqoaamBEossJPFS5EqCpATRe6LoJ5hd6l1kOutVRZZM8UpdRWjz4lfVaRaERSAOKI/A4HqCvbl0wSlpFKtek2gCgEgd1U+ybKz58+gQ4seTbq06dOoU6te7Q4AAm28OCe4hoCqGjaX4bBccE0bo4sEihHYdIji71ApA1LSVupUqpeA+IBqNOpDc1QDUQZ7qY0dMXO8BqCr5h128nsqrg0jkIgpumnpgKlvt1JjWmzfPbjvNV7dzPUs2WcdQAK9xNQ0C/Dzgf8/AwIQUHbn+QYTcJsM5xVgiEyInEoCxtbVbJPYRlJunLFm4okopqjiiiy26OKLMMYo44w01mjjjTjmCMM0ZvAhihmqgFibCreJQVoCAZCTJAvBLUhcIRSNpg4aQ60AHS8JhlKdaH4MFNU9CYCHTn/YhFYKVYEgyZ5+4cFXjWgIbOLCF+2FR2Y+npXBGAtf+HGgdNQwGBooV7mFpCoWWihRlKCNp8JMuAkpIm46VmrppZhmqummnHbq6aeghirqqDKYJBWJH9I2qZGhbUmkIsAJ96QhgYG25ArXPXfSG1lSp9VnL4ERgC/lickfNf6BVqU/1uC35n7SIFumaOgUy+bRmNLi2WgvpThYIJsIKijoZ29otkkiFoWS6JMYisYjAWjq9oGkRI5I6r345qvvvvz26++/AAcsMIrq3EPVFzTNq2q9lJL7U5yCrbWgrF7RumerplSpwpW8TifKr6Eh6ZEZBIR57bHxadtZApSokiYxdb6XbWjNKtUCnSeLNzNoX0w1Jx/gAtoPyJ1F9daPDhzq5NKL1uoZwmYsAKmR9I7U8MBYZ6311lx37fXXYIeNdZEqo1ic0yp67OqKd7boZrIsts2iuESn2PTFKpIt9t7bhAAAOw==';

	} else if ("metric" == units){
		distFactor = 1.609;
		massFactor = 1*tonnes;//.45351474*tonnes;
		distUnits = "km";
		massUnits = "kg";
		divisionFactorFixed = 150/5671.5064; // for the fixed values -- for some reason is f'd up
	    scale = 'data:image/gif;base64,R0lGODlhPwCcAMQAAMMxMs6Dhsxzdtzm674QEdOkqMEhItnV2tfFysVCQ9CUl+T4/eT4/MpiZeX4/cdSVOT3/NW0uf+cIf+cIrwAAN72/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAA/AJwAAAX/4CSJ0OKUZaWubOu+cPxKkuOYELOkcu//rQmDYcvpeMCksiVZDCE2HGNJXdpuR6euyv05nkSdztEtxxilYw66MLtbu+PxNH3bdTiTc9G2v79Ge0Nkfm5oTjk7N32FZTdfX3w5hI2VlpeYmZqbnJ2en6CfARSkBCsJpAorBwAUBggroxQNmwmmLAIEBwIUByoAABUABioFFArGqpkECS0GxBEUARUHsxWjsA29FQQPmdWlBSoEwQgUAhXR6KPiqAPcwZjm0wAEAwMU5ecVxusU4q3ekevEDl4Fc+jUXftXwZ1BTgUNBDM2rRo6Xtko3KPgDdMoesQqYOTlSxixYcWk/yXTxCsfLBWojq1q9SoWKVqhcurMNOqdD1kAxFVQQOCmCgWkEvi009OHAAO+cg2VicBAg2rTDEzz07MBgAHGKDgct/VUMxUBbo1Dx/XfV260xuIr+6sjPwovbZVk6orY3IVLCdBtePbaLVRC2x4wgI5AXI0rnka1h3Ra1ceJ24LFG/YB5MikDAglatQcqX2YDHiTutNHgaIyW8ueTbu27dtmPp5KNdPVy4XWNh0oujXXrm3CgqG8iyx2Js/SVDxLF70aLWwVtPnqpskYqq0DEVL31w7ywEwAEujGpw9dv4UAzce7lPaAboPiFRZ0eP5Sq9P7SHRXRftglJ1G+NjFU/90IuFF0i8nhUTRSpvc1xBvKrDim03B4ebhhyCGKOKIJJZo4okopqjiiiy22AJ0CewVkzLU0PSbLDh5dI45Zxn3YHImpdQcjZlE09F00RB4HV4HbqfgJcbYM05748F3oUDzZTKAgOwdtM97BQX00CaewRLePvoxxF+Wz20jIEXUFMikNhs92Yg2Cgxw3kjIobTchM5ZMgCMS83YW01oGeXioow26uijkEYq6aSUVmrph9AB8JuhGdrIYY70RTedSLr8CEyQzFFYi5vQVGcNdtpxY6clw91yZkL77CefcAZwVEGX4oHJkJj9XTIATT7dWqWuWGqCCgG/venqRXMi6Cu+JkhREAEuDvYZYUoBqGpJTKflhWGNGyba4aXstuvuu/DGK++89Nbr6JZZcoouosCBegkCrcznY5/KSXiMuJXg0+t8SLq6ZEZOahljPisom2Z5zWrS5a8UB5vrsLtqTPGUXuJK3pVjYrJxBdISSG1GdW6yMp8l+WlwuIEaOzJM52rIL472Bi300EQXbfTRSCc94mtiLeWhng1AHSJSqtgSYkGeOX0bL+JkDSLWn3mIFEBqPd2N1CEyrZTSbGcSAgA7';

	}

	
	tree = 55; // lbs/year/tree planted
	carYear = 12140; // lbs/year co2

    var tempNation = new Array
    var nationFootprint = new Array
    var nationFlag = new Array
    var nationName = new Array
	
	for (var n = 0; n < 5; n++) {
        randomNation = getRandomNation();
		tempNation = randomNation.split("#");
		nationFootprint[n] = parseInt(parseFloat(tempNation[1])*massFactor*divisionFactor);
		//alert(tempNation[0] + tempNation[1] + nationFootprint[n]);
		nationFlag[n] = tempNation[2];
		nationName[n] = tempNation[0];
    }  
	
	distance = 2*CalcDistance(origin, destin);  //miles
	distanceConverted = parseInt(distance*distFactor);  //miles
	airPounds = parseInt(distance * airFactor);
	air = parseInt(airPounds/tonnes*massFactor);
	carPounds = parseInt(distance * driveFactor);
	car = parseInt(carPounds * massFactor);
	busPounds = parseInt(distance * busFactor);
	trainPounds = parseInt(distance * trainFactor);
	trees = parseInt(airPounds/tree);  // this stays in pounds
   	
	if(airPounds < 2500){
		terra = 2500;
	} else if(airPounds < 7500){
		terra = 7500;
	} else if(airPounds < 15000){
		terra = 15000;
	}
	
	//////	End calcs for header contents

/*	
	var expand = document.getElementById("expand"); 	
	expand.addEventListener('click',function(){
	    // function code here
	},true);
*/
	//////	 Begin header HTML/CSS
	
	realcostsExpand = readCookie("realcostsExpand");
	if(realcostsExpand == "contract"){
		addGlobalStyle("#rcWhole{display:none; position:fixed;}#containerHalf{display:block; position:fixed;}");
	} else if (realcostsExpand == "expand"){
		addGlobalStyle("#rcWhole{display:block; position:fixed;}#containerHalf{display:none; position:fixed; bottom:-3;}");
	}	
	
	//addGlobalStyle("");
	addGlobalStyle(".tree{margin:0 0 0 0;float:left;width:17px;height:25px;}#whatToDo a{color:#fff;}.titleBar a{color:#fff;text-decoration:none;}.realcost {margin:0 0 7px 0;padding:0 0 0 0;font-size:12px;text-align:center;}.realcost a{color:#fff;font-weight:normal;}.realcost a:hover{color:#fff;text-decoration:none;}#containerHalf{position:fixed;bottom:0;margin:3px 0 3px 0;padding:10px 0 0 10px;width:100%;height:78px;background-color:#FF8B19;z-index:10000;}#co2{margin:0 0 0 0;padding:0 11px 0 0;float:left;width:120px;height:62px;border-right-width:5px;border-right-style:solid;border-right-color:#fff;}#co2_lbs{margin:0 28px 0 11px;padding:0 0 0 0;float:left;width:84px;height:62px;text-align:right;}#num{font-size:35px;color:#8E0303;font-weight:bold;letter-spacing:1.5px;}#image_caption_wrap{margin:0 0 0 0;padding:0 0 0 0;float:left;}.image_caption{margin:0 12px 0 0;padding:0 0 0 0;float:left;}.image_caption_last{margin:0 0 0 -5px;padding:0 0 0 0;float:left;width:118px;}#ex_container{margin:13px 0 0 0;padding:0 0 0 0;}#circle{margin:2px 5px 0 0;padding:0 0 0 0;float:left;}#expand{margin:0 0 0 0;padding:0 0 7px 0;font-weight:bold;font-size:15px;float:left;}#expand a{color:#fff; text-decoration:none;}#expand a:hover{color:#fff; text-decoration:none;}");
	
	treeImg = '<div class="tree"><img src="data:image/gif;base64,R0lGODlhEQAZALMAAN72/HerEn2vHIi1L9XltZK8QrfTgefw1qTHYPP46s7hqszgpoa1LXmsFY+6PHqtGCH5BAAAAAAALAAAAAARABkAAARUEMhJq714HuOeM0emMEFZMspFCGYrEFVStHSRUAutLxSi0wjK4NcaUBpEU0OYLBknvmZwkmvyJrKkrbL6vS4jGiqzMYEyExOaol5L2m74Wu6u2+8RADs=" width="17" height="25" alt="tree"/></div>';
		
	//eval('flag.'+'us');
	forest = '';
	for (var f = 0; f < trees; f++) {
		forest += treeImg;	
	}  
	apost ="'";
	
	//////	Begin generate html

	headerCode ='<div id="containerHalf"><div id="co2"><h1 style="margin:0 0 0 0;padding:0 0 0 0;font-size:28px;font-weight:bold;color:#fff;font-size:28px;font-weight:bold;">CO2 for this trip:</h1></div> <div id="co2_lbs"><span id="num">'+ air +' </span><h2 style="margin:0 0 0 0;padding:0 0 0 0;font-size:22px;color:#8E0303;font-weight:bold;">'+ massUnits +' CO2</h2></div> <div id="image_caption wrap"style="color:#fff;"><div class="image_caption"><p class="realcost"><a href="http://www.terrapass.com/flight/products.flight.'+ terra+'.php?flight_carbon='+ airPounds +'&flight_miles='+ distance +'"target="_blank"><img src="data:image/png;base64,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" width="147" height="47" border="0"></a></p><p class="realcost"><a href="http://www.terrapass.com/flight/products.flight.'+ terra+'.php?flight_carbon='+ airPounds +'&flight_miles='+ distance +'"target="_blank">offset this flight' + apost + 's carbon</a></p></div><div class="image_caption"><p class="realcost"><a href="http://www.cwrr.com/nmra/travelreg.html" target="_blank"><img src="data:image/png;base64,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" width="147" height="47" border="0"><p class="realcost">short trip: bus or train </a></p></div><div class="image_caption_last"><div id="logo"><p class="realcost"><a href="http://www.therealcosts.com/"><img src="data:image/png;base64,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" width="110" height="37" border="0"></a></p> </div><!--logo--><div id="ex_container"><div id="circle"><a href="javascript:expand();"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAP5JREFUeNpiYEAD////5wfieiC+/x8TrAdiewZ8AKjAH4jf/ycM9oMsw2ZA/H/SwHkUg4AcfWyq/n54/P/PoxNgjMtFyIbsx6bi19GJ/791q4AxHmDPBHIF0BwHBvJBAROFBoBAAAuQEEAW+bkymuHf41MYKr/3qMLZbOFLGJhlzeF8JgYqABZ0AWbtIAYmqC3/Hp+Eu4rFKheuhpFPGsOQCygCOsFw9u9jk+CGsFrl4XLIA5B3DgDxBwp8s4CJkZHxI5AxAZssyNlMsmZgjAN8QNELTcakAn9suZcUg+Lx5eR6Ajl5PzSVI7yNwyB+aEo2QPP/AWAYXkRXDxBgAKsQsN2KzHz/AAAAAElFTkSuQmCC" width="17" height="17" border="0"></a></div> <!--circle--><div id= "expand"><a href="javascript:expand();">expand box</a></div> </div><!--expand--></div><!-- img_caption_last--></div><!--end image_capt_wrap--></div> <!--container--><!-- START LARGE HEADER --><div id="rcWhole" style="width:700px;min-height:50px;z-index:1000;background-color:#FF8B19;color:#2E3F26;border-width:1px 1px 1px 1px;border-style:solid;border-color:#FF8B19;-moz-border-radius:11px;font-family:arial;"><p class="titleBar" id="leftTitle" style="display:inline;font-weight:bold;margin:2px 0 2px 0;text-align:left;padding:0 0 0 15px;">CO2 for this Trip by mode vs. other metrics</p><p class="titleBar" id="rightTitle" style="display:inline;font-weight:bold;text-align:right;padding:0 0 0 0;float:right;margin:-14px 0 0 0;z-index:100000;"><a href="javascript:contract();">Hide</a></p><div id="graph" class="collapse" style="width:680px;z-index:1000;height:156px;border-width:1px 1px 1px 1px;border-style:solid;border-color:#DEF6FC;-moz-border-radius-topleft:11px;-moz-border-radius-topright:11px;margin:0 8px 0 8px;background-color:#DEF6FC;"><div id="scale" style="background-image:url('+scale+');background-repeat:no-repeat;height:156px;width:50px;margin:0 9px 0 0;float:left;"></div><div class="barWrap" id="planeWrap" style="position:relative;bottom:0px;height:156px;width:60px;margin:0 9px 0 0;float:left;"><div class="bar" id="plane" style="height:'+ parseInt(airPounds*divisionFactor) +'px;width:60px;float:left;background-color:#BC0000;position:absolute;bottom:0px;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAASCAYAAAAg9DzcAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJ5SURBVHjaYmEAgt0KqvYMuMEH1we3LzIMEsAIdewBAuoeAHEB0OEbB9zFIAcD8f9vjx//xwY+Xb32/0Zjy3+QGiD2HxTBDHTI+cPWDv+frl77/9fHj1gdDnX0ewLJh/ZJAupgfiA1AYgTBM3NGIxXLMGq+GpJOcPztetBzAaQemAS+QjVDwr5AqSkBUpCG2DyVHcwUkjrgyyVDA4U0O7pxKrh0bwFDPcmTGb48/nzByB3AchhII+y8PIm8GppgtW8P3kKpvwCVH4DtTIuI5bkAQqtDUr5uQxKBblYNf3+9Inh+Zp1DM+A+Mv1G3BxHk0NBvW6agZBC3OGV7t2M7w/cYrh9a49DD+ePgWXNlAPkAoeQGPzIlYHQx0dDwo9re4OBqmQILymgRz/5dp1hu9PnjL8eAJ2GINkSCADp4wMXM33J0/ADv/z6TPJrgV5HBooCUBHL8SXEftBJQMoIw40uFJcBs7wOEMYydHzQT7DlzzoAUAxdNTWCcR0YMKnEBgFiSAH35s4meFsRAxY40AApKT0gZmQ4sUf3l2MExDeAMw4HsCMJvDv5y8GDhlpBlY+PrqF7uXcQoZfb95cAAZgIyOJFUw9KMSBWAFUIoBKA5DDebQ0GMTcXHHq+wzMlO9PnCQq04HU/gFmZBiAFpEXoJnuIiM5vgY6HFR7BADLXga5pAQG2aR4jBAHWQwq9pCKtQdQTEwxhqzuAXLpwEJquwNaWSgAKxcGNWCZi+xQLGXvA2jFsYBaFQcLkQ7Vh1bdDiA+qPoG1Wqg8hdUDoMcCC5nP3+GRd8CaO32kKZVMxGhqwDFDkhsBmgbYgOtHEntlh4/Pe0DCDAA0uXSyccr0dcAAAAASUVORK5CYII=" width="44" height="18" id="planePic" class="pic" style="position:absolute;bottom:5px;left:10px;"></div></div><div class="barWrap" id="carWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="car" style="height:'+ parseInt(carPounds*divisionFactor) +'px;width:60px;float:left;background-color:#BC0000;position:absolute;bottom:0px;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAQCAYAAABk1z2tAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKVSURBVHjaYmQgAuxWULVnoBC4Prh9kBx9jIQUHHVyO69SXmLAysdHtuN+f/rEcKO2YYH9qWOJVHUgMOTijZcvXvD9yVOGa6UVONUB1YDps5GxGHIsvLwMWj0dYPal9OwCYEhOJMWBTPgkuZQUCwQtzBnuTZhMduj9+fyZ4VpJBQOvliaDUn7uBFKTCwtSaOkDqQBkSZnoSAMQLRUShNcQDhlpMA10AE41n69dZ1AqyGX4cvv2ht3bGCbgMe4ARnoFOq7/4dz5/789fvx/IMGvjx//v9y56/9BE4v1KA68Ulz2fzCBp6vX/ofGKAMTiAFKZ4MJiLq5gKgEWBoU4ISmIeRi4fmadQzvjp+8wC4qosBvZChAKB2SCt6fOMnwYtOWDz9fv3nAp61lIBkSyMApIwOWAxVpEv6+AQwT+wpZsCXms1FxD/58/PgByAVlkgdPl6/88PHceQHNtmYBajjuelXtB5CZUK7Bmz17LzxasEjAeNkiBVBuBwE+PV0FYOzKg4qZByBHwcCljJwPQMcJAHOkgf3FM6AyToFHU0MBaOCDZ8BQpRSAzACZBTITZDbIDpBdIDsvZeU9wFpQH7Kw7ec3MkhgFxcXeDx/4QVBczMD4xVLUEL1pLf/Bz59vQ8iDvYKlDjwzYGDDz5dvCQAdJwActo/GxHD8P7kqQuyifEGDP/+PXi1c/cGuxOHC7HVHvV3+ydh5Cyg+H9qpT+QWegAZCfIbmJqkgugaABlFBh4NG8BiHpAxTxyAWomPFNCk88DoupioE/mc0hLJ4ByLkgzMNpBwg7ktkiwmA8q4w5IBgcKgHLuq127Gb5cv7EBaH4g0Y0FUEMBSMHS2wKg5ofULGZAORRW1oFCDmj+QmzqAAIMAL7tPbIEZLshAAAAAElFTkSuQmCC" width="40" height="16" id="carPic" class="pic" style="position:absolute;bottom:5px;left:10px;"></div></div><div class="barWrap" id="trainWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAALCAYAAADWfWXXAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFGSURBVHja1FXRTcMwEL1E/adMQDegGzRIDJANyAhlgnSEdgJgAjJApXYD0g2cCUgngHfinXRYLvw4SJz0ZL0nn33Pji+FIPYiTxgayR9HYMMxR4xAB6zvRc4mzmDggQYCYbFkUnBco7/AF8A84j56rjdnrnGNKsF9PZ5rrRXqrmHkJLyFV+ADuPE7gh+ANuKHH3ib4sCK66+of+PUUrxNcYy3wDvwBlypVtqpwNUg/yB4+g3rXqtWqEteYx/Nz/E5Bfcmcn1O4rQRpq7NxFSR+2Gnoiojd9k3mNiA2JuY0sT4Vya6CQ1oP7/DuJ3QQyixyQ4ooht5praMHzt1b7yjFv8X1MALO8pjlHO8kNNQ3/giVaM+RuurPsycWBNiJ6ftbP+lWRs+2WbW3tzcwc0NZsAX+EvO6HK2rpN10RurOXdn4qcAAwAwm40zqv0d2QAAAABJRU5ErkJggg==" width="49" height="11" id="trainPic" class="pic" style="position:absolute;bottom:10px;left:5px;"><div class="bar" id="train" style="height:'+ parseInt(trainPounds*divisionFactor) +'px;width:60px;float:left;background-color:#BC0000;position:absolute;bottom:0px;"></div></div><div class="barWrap" id="busWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAPCAYAAACWV43jAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAExSURBVHjazFbbDcIwDEyj/pMNYAPYgH4wACPABmxAR2ADRoABkCgbZANgg25Q7OqCgmWEQARiyWpr53E9O3YKQ3IwZkiPmnRh8pCWdD4z5lQSuDF9NKQOzgbPCgO9ssAE45s3fSOox9pBHOaxXDCGyToxezvSjnRLOggzYDtqv8d29n/gW2PdqeLrMHeI9zPbS6aSUROdyxxiSziuB7DIYK0Iay5yTzMbxf1vEqWWE3iq4lm+5HKarclbnH2RB+0PwWhp5kvFuI/qYkjWOiEwjz3jmrgKIS6Vv2DdCNsmmvRt1hpBQIvv3mYFtRqQUcJTvlfaqwPINhTqSdRmvGBPtiKXILyrJ/v1rbbQWhWcDyxyhU9UA7X9Kr4ohBBLmUdJe8Gt4prwkMj9FgEcy02AAQB5ml6H7QPSVwAAAABJRU5ErkJggg==" width="40" height="15" id="busPic" class="pic" style="position:absolute;bottom:5px;left:10px;"><div class="bar" id="bus" style="height:'+ parseInt(busPounds*divisionFactor) +'px;width:60px;float:left;background-color:#BC0000;position:absolute;bottom:0px;"></div></div><div class="barWrap" id="carYearWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="carYear" style="height:'+ parseInt(carYear*divisionFactor) +'px;background-color:#8E0303;width:60px;float:left;position:absolute;bottom:0px;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH1SURBVHja7FfRbcIwEHWq/pMNYAO6QdgANggb0A3CBtAJoBNQJqCdIHQC0gniTuCe4bm6Xm0nlEhFVZ90Skjs+N35+e5IVATGmCFdlupyLJMk2Z4zIYmQ6tGlgt1HvjElu4uMsY4NyEZE7vViF4lYbk4YNowryHYxB8lqshLOtsJN5J2NgL7US5r/bqOFqK7PiYz1aAWvfhs7svHRIbrZ0HWirgfaatISq+kmVdeFqSVm1PXhyUdMQ/gVImlFO+96YaQRt1NzrPNF/Bw10sRBCHLWocAXML7mDOnkEwon0qEAEYnQ83NhSYwDz3P2u0xY6bFh3WMrJZ6R4QcdnLhJQBojN8abOwP5bNOVuCKy6LctRTzMww6J9aSerJxaFXEamLHQrim0b10eSdTMKeRT0fcf1T/+KkIay7H3L7zvwlF+YGMGSCUjmV7cXHsK0f64eX3oy6E6lqBTe9TqOBfiucvWmf24SyNIvt8SssuPMh1gvsShiVQhP+7pRA+oAjUIFqFGQPR5C0Es4w43EePRKDzveTmZeZwxYtEa5DZorzixkpW5Uq51K9pgp4tQm7yld3uuGU9JsdhDgyk3p103BuVJ+xrVmx/WO90wJoXANWtttBD9GoTS1v8FQluJdzv+ryiwlSuuK6Y3w0peJg5Vztf5EGAAXR31YSLJun4AAAAASUVORK5CYII=" width="38" height="25" id="carYearPic" class="pic" style="position:absolute;bottom:5px;left:10px;"></div></div><div class="barWrap" id="usWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="us" style="height:'+ nationFootprint[0] +'px;background-color:#8E0303;width:60px;float:left;position:absolute;bottom:0px;"><img src="'+ nationFlag[0] +'" width="38" height="24" id="usPic" class="pic" style="position:absolute;bottom:5px;left:10px;" name="' +nationName[0]+ '" title="' +nationName[0]+ '"></div></div><div class="barWrap" id="euWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="eu" style="height:'+ nationFootprint[1] +'px;background-color:#8E0303;width:60px;float:left;position:absolute;bottom:0px;"><img src="'+ nationFlag[1] +'" width="38" height="24" id="euPic" class="pic" style="position:absolute;bottom:5px;left:10px;" name="' +nationName[1]+ '" title="' +nationName[1]+ '"></div></div><div class="barWrap" id="cnWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="cn" style="height:'+ nationFootprint[2] +'px;background-color:#8E0303;width:60px;float:left;position:absolute;bottom:0px;"><img src="'+ nationFlag[2] +'" width="38" height="24" id="cnPic" class="pic" style="position:absolute;bottom:5px;left:10px;" name="' +nationName[2]+ '" title="' +nationName[2]+ '"></div></div><div class="barWrap" id="worldWrap" style="height:156px;width:60px;margin:0 9px 0 0;position:relative;bottom:0px;float:left;"><div class="bar" id="world" style="height:'+ nationFootprint[3] +'px;background-color:#8E0303;width:60px;float:left;position:absolute;bottom:0px;"><img src="'+ nationFlag[3] +'" id="worldPic" class="pic" style="position:absolute;bottom:5px;left:10px;" name="' +nationName[3]+ '" title="' +nationName[3]+ '"></div></div></div><div id="whatToDo" class="collapse" style="width:680px;z-index:1000;height:80px;margin:10px 0 10px 8px;float:left;background-color:#FF8B19;color:#FFF;"><div class="whatWrap" style="height:80px;width:124px;margin:10px 10px 10px 0;float:left;"><img src="data:image/gif;base64,R0lGODlheAA8AMQAAP+oUv/ixf+SJ//38P+ZNf/w4v/p0/+gRP+2b/+vYP/TqP/Mmv/at/+9ff/FjP////+LGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAB4ADwAAAX/ICSOZGmeaKqubOu+cCzPdG3feK7vfO//wKDwRAAYCaWiESAoLQEQwRI5rMYQj2ygFMhmGySCdwABeB28QwBqpYm9JW+WQcLOy2edYJFlt2cDXgcjZnJkI3xfeFloOV19fzQMXmAiiXKDIgaCiw+NOI8PfpEwDV4KI5tyD5UQciKFnhAEDQ4NmSYHtQ4OTCNSqqwAVCUHS01hU8W7CcgkxkZORriwXgYiAtZedJ1bnQ6Xc84QBwWrDwONsXKfJJcLJcG4CeaG7RChcVomck0JXgjqHTLFqFqWQOdQYUN47gGCTuyIeCkQZuIIOw0NOMtHwos3EqGgKPBCYGSWQZMg/0F8oMBBsAcjTD4owKvegy3r8pyQN4KgLIgDArzkhg9Ox30lHOSpR/GfIpuE5PixyUaBuQLIsmW5JiKkCowKIQSjEkoBMowPMnEc4dFELAZvWEbZFvdjLK4iZI6aNcJplhFeUwhAeCgu17gDxr3rapQtUhJa0WFMoOmg30+x4I1QqhIbggWhGgdOIZMyxocQ/IY1eJPx36OtTQQLhuxSygeUWbfjLApbuFUUXfdWEQvVbWS879UVri92id8P8PrtF7XgZi9swhlY4Pfj6BQCIxP1q7l67FDU2pqYnqV8ZGskYu3GPmsiMfVFO6fgfTt3J7wigCWcH7F8VNEqo4T2QP9535DAGxSZjbDcgCzENUYJDKEWhU2oheIfbwaSYNNr18nhX4Ml9hbLAIMQEMwhENzGQAMnnqDgahDwtiAAAVkkAm8GDKNjiDHJEWJOxKD4I30QMITOOSne8dUq1ETx0iosmteQcyWgdY8rPpo3n0rsoVOaCBZyiQJDwZUggIJZFFClTKc8QiSavPCSZIB5aognL6MAkCcxByhgQFAOCEBAnv4BwEABBQTgJwqhfEmIAgEMYAADCIxzUQAFbAoFArxMSkoQg5F06qo6tBjMnazGCgOce8lqqwu3ZYHjrbyu4JMBlvYq7LDEFmvsscj68MQOCNSYLA6v6KBUAFU+W0P/tDnwtoCn1sqALQ46DtBKt942Bu45BdQKAwGk2lKtCLow6ukSgwiQAC/OEldqE99icy+gL+ho5J4tCEBnnNQccKV1IniUgJMD5FvMSwOglZSTM0mc1JaMcCvYwgdlkuqWrYzRUGIqEIAxlNiAzPB+HB9kKgrhMKAAQ97wRpMDNn0EnAN0jmtCaC2NCJMlchgAqokrCLxlkCu8JzJDSCxwVVYXNrxNkS8nIRVg0VqooUxtouA0xwoQ3NcpJNSCQJXzQKV1FsQUmAJGRJETrU842vRulDEflOgJybEgwGdwOkZiNzB3HW1/z1GiwtmBa2RC4SpAh+23dputk+JHf5fj+OeEB56Q2pjTnDR3wYAeH36Xkw7ma6KnXrrpWqgrAt8kJBDAAg0QEFmWIsg9+9GswQoB7xJGa3uMTHpuesUrHDDGRl4k8NYvWR//+mO5XI9ItH6hzJr50sc8OAuhFICAoxdaH/IsL7lunvIQ2GSA9r+NYJO4AAhHsAC3Cri8QH4kK54hzoEMzsHOLaYbAQIz4jEHPU13KnhYQ8pTpgHcBjUOBN8J0KKrtZTBaOJggdPEVQMBNABUQVkA3AyFKEUx6kd5CkOfWFCoQ3EKAu36EgIYsIkAKACDG5PDtsjVKxCpjYmsUkoBNAbFVZGqiljMoha3yMUu6iAEADs=" width="120" height="60" id="whatTitlePic"></div><div class="whatWrap" id="busTrain" style="height:80px;width:124px;margin:10px 10px 10px 0;float:left;"><div class="whatIcon" style="height:35px;width:35px;float:left;"><img src="data:image/gif;base64,R0lGODlhIwAjAMQAAP/ixf+gRP/w4v+vYP/38P/TqP+ZNf+2b//at//p0/+9ff+SJ//Mmv+oUv/FjP+LGf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAjACMAAAX/4CMOTmmeaJoeohgIUCzPdG1DQvAs8O3/MsHjACz+SMZkrVQEOBSNqMIBKDJvhUEgyu0GBgXftdYQVW8AUeM2nhVaVIB8Lle0wkuHzfFQ+ft7emRrSVGBNoZJA4Q0bTKAPgh4EHyHNAQPDD4JInhvBHk1aWc2BAY8MaOhNAgPCZENAXhCCKszfKClLa4QmIK3vzJ8Bl1eu1sGkMBLu83Ou8ExjpTP1dC2wg8NDgPWIw5l0ZTiuDHJ1QYxvtjSDzI61QGP5ORDTt59ACz0zPjP/I38/WMHwck5PyZEGKBCMEYZdz/UsBHn8EG6HzoYNaIIIUGDWj8QNHhlSYlJbiZTFbLokbKIkAcvWgLJsesAwpt+uokIAQA7" width="35" height="35" class="whatIconPic"></div><div class="whatTitle" style="height:35px;width:85px;float:left;"><p class="what" style="font-size:17px;font-weight:bold;margin:0 0 0 0;padding:0 0 0 7px;line-height:1em;">Bus & Train</p></div><div class="whatLinks" style="width:124px;height:35px;float:left;"><p style="margin:5px 0 0 0;padding:0 0 0 0;font-size:9px;">Visit <a href="http://www.amtrak.com" target="_blank">Amtrak</a>, <a href="http://greyhound.com/home.asp" target="_blank">Greyhound</a>, or <a href="http://hopstop.com/" target="_blank">HopStop</a></p></div></div><div class="whatWrap" id="carpool" style="height:80px;width:124px;margin:10px 10px 10px 0;float:left;"><div class="whatIcon" style="height:35px;width:35px;float:left;"><img src="data:image/gif;base64,R0lGODlhIwAjAMQAAP+oUv+gRP/38P+ZNf+2b//Mmv+vYP/w4v/p0/+9ff+SJ//at//TqP/ixf/FjP+LGf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAjACMAAAX/4CMaTmmeaJoSohgcUCzPdG1DR/Ao8O3/ssODACz+CA6jslZaOmPNYmNhWjQExWhNwCAMWmDRwMDA2rQygUMRbocJ5hk6pnPbW4E4NDljPBwNgYKDhIEFfzRzLD1ODwCJfDIDCjELBgg+DnAxAA+QM0KPEF8GEA6MBQgIIgwxCQ8NcpEQDQ8JMQwBCAcKCzK9EAkAZoezaLUFEAhfAAsBycoACWtDMbXGs4exBm0x3GEFAgKIMmgOD76dYAOubpfke3J382DY8vT0peXGIoDf+Q3OOZIlL4CMOnfY0Rm4bwY3URAQ2lEIoRNEU7NePSjQoMAAAAMCAFAAUuTHAYAOU9kimEZiEkAVTcVKsmCdnjkI2OBzE4vlDAR1AhQixOKBLiazyokg8kMl009bCiTQc0Mq1XhPlszJ+sOBPq5FFoEFIsQoo7E0coBBoqKt2xJFH4QAADs=" width="35" height="35" class="whatIconPic"></div><div class="whatTitle" style="height:35px;width:85px;float:left;"><p class="what" style="font-size:17px;font-weight:bold;margin:0 0 0 0;padding:0 0 0 7px;line-height:1em;">Find a Carpool</p></div><div class="whatLinks" style="width:124px;height:35px;float:left;"><p style="margin:5px 0 0 0;padding:0 0 0 0;font-size:9px;">Visit <a href="http://www.carpoolconnect.com" target="_blank">Carpool Connect</a> or <a href="http://www.erideshare.com" target="_blank">eRideShare.com</a></p></div></div><div class="whatWrap" id="offsets" style="height:80px;width:124px;margin:10px 10px 10px 0;float:left;"><div class="whatIcon" style="height:35px;width:35px;float:left;"><img src="data:image/gif;base64,R0lGODlhIwAjAMQAAP+oUv+2b//w4v+SJ//at/+gRP/TqP/ixf+ZNf+9ff/p0//38P/Mmv+vYP/FjP+LGf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAjACMAAAXt4CMGTmmeaJoGolgIUCzPdG1DQvEM8O3/MsEjACz+SMZkraRsxphOJTRqnFKBVpvgYCgRHFKwjRAYtM6MZBZCQJzfokNVLGPB4QNAwtCzWe13bw0OCQB5ckt0B3cFAI4tRDMEjn1PdIABBAs2BjcGAwozUwA7oVQFCJuWMgwPAFcQpGmrMQsIBVcKZg0yVrqdnDYLZJC9dDECjgQ0gI4AOnCIEGsQB4Z6Dg2BcJG0WgaFZtvFosc+i+MIyzTUNq14mTftfl8OBgeVfuaw+vxY+/7KBfQxL2C2gTdY5EMo5MELhEGgjVBBsaIJQCEAADs=" width="35" height="35" class="whatIconPic"></div><div class="whatTitle" style="height:35px;width:85px;float:left;"><p class="what" style="font-size:17px;font-weight:bold;margin:0 0 0 0;padding:0 0 0 7px;line-height:1em;">Carbon Offsets?</p></div><div class="whatLinks" style="width:124px;height:35px;float:left;"><p style="margin:5px 0 0 0;padding:0 0 0 0;font-size:9px;"><a href="http://www.terrapass.com/flight/products.flight.'+ terra +'.php?flight_carbon='+ airPounds +'&flight_miles='+ distance +'" target="_blank">TerraPass</a>, <a href="http://www.carbonneutral.com/" target="_blank">CarbonNeutral</a>. <a href="http://www.tni.org/detail_pub.phtml?&know_id=56&menu=11c" target="_blank">Scientists are sceptical.</a></p></div></div><div class="whatWrap" id="moreInfo" style="height:80px;width:124px;margin:10px 10px 10px 0;float:left;"><div class="whatIcon" style="height:35px;width:35px;float:left;"><img src="data:image/gif;base64,R0lGODlhIwAjALMAAP/TqP/p0//at//38P+2b//w4v+ZNf+9ff+vYP+gRP/ixf+SJ/+oUv+LGf/FjP///yH5BAAAAAAALAAAAAAjACMAAAT/sEniqr04ZyJlKk8ojmRpPkXSLODpvmLREHD9UnZeVrVwMB3GQVDjuQAGCYPhWEoMgJexNAAyoiWAdXCajgKLBfYYDpi8oUGZFFCUwAsuCf1gLMwiQXIiD4EZOw4kAA1EIoQdHn0PAg1jIWgGgCJqDQgKAwALMyQMBnOCeY4jjQ19DiuDhSNeHHMNkyEHEiWcIl5LJAoOYwKbsSK5t6Ehli4DHCt4I0CsxA8NzySzsC2vziPGJ1YuCA3YwcCd0S7CkM+z5eQnDQfgIY2PXwrWqobnJJInbfXMn+8hCN1jtk6VPDp2lgUrKOJPICprasBZhO9NGHlZIoI6UQUWxgdaMWBRHPYCiRImThpAkSLNhA8gSoYUaamjCIKaODn0w+lCRoMPPGGkSERBg9GjFZI1iAAAOw==" width="35" height="35" class="whatIconPic"></div><div class="whatTitle" style="height:35px;width:85px;float:left;"><p class="what" style="font-size:17px;font-weight:bold;margin:0 0 0 0;padding:0 0 0 7px;line-height:1em;">More Info</p></div><div class="whatLinks" style="width:124px;height:35px;float:left;"><p style="margin:5px 0 0 0;padding:0 0 0 0;font-size:9px;">Want more info?<br/>visit the <a href="http://therealcosts.com/wiki/index.php?title=Main_Page" target="_blank">Real Costs Wiki</a></p></div></div></div><div id="forest" class="collapse" style="width:665px;z-index:1000;min-height:30px;border-width:1px 1px 1px 1px;border-style:solid;border-color:#DEF6FC;-moz-border-radius-bottomleft:11px;-moz-border-radius-bottomright:11px;padding:5px 5px 5px 10px;margin:0 8px 0 8px;float:left;background-color:#DEF6FC;">'+forest+'</div><p class="titleBar" id="bottom" style="font-weight:bold;margin:5px 0 2px 0;padding:0 0 0 15px;">'+trees+' Tree-years required to convert '+ air +' '+ massUnits +' CO2 into Oxygen</p></div>';
	
	//////	End generate html 
	//////  End header HTML/CSS
	//////	Begin finding location for/inserting header
	
	var target, header; //////	making two new variables to store hearder creation info
   	header = document.createElement('div'); //////	setting var header as a new div element
   	header.innerHTML = headerCode; //////	setting the inner html of the new div to previously generated header code
   	
    if(getHeaderId(href) != 'notair'){ //////	The header id is the name of the element before which the header will be inserted
		targetId = getHeaderId(href); //////	pulling the info we want out of the headerid array and setting it to a variable we can use
	}
	if(isString(targetId)){ //////	checks to see if targetId has been set to a string value
		target = document.getElementById(targetId); //////	if it has, sets var target to be the element of the document specified in the headerid array via targetid
	} else {
		mybody = document.getElementsByTagName("body")[0]; //////	if targetid is not a string, grabs th body tag of the doc and
		target = mybody.getElementsByTagName("table")[targetId]; //////	sets the target as the number in the <table> specified in the headerid array
	}
	if (target) { ////// if target has been set up
	   	target.parentNode.insertBefore(header, target); //////	inserts the html stored in the header var before the target var
	}
	
	//////	End insert header
}

//////	end code to generate header
//////	Begin car code


// CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR 
// CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR 
// CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR  CAR 


// this code adds the CAR header to the page -- calls getHeader to determine what is the correct Id
// to insert before
function addHeaderCar(href, carbon, milesCar, cookieSet){
// 	get the hopstop.com info -- could not do in function b/c of weirdness  //
	doHopStop = false;		
	doGoogleTransit = false;		
	var hopStopResponse = "There was a problem with the request, please try again.";
	// get the from to address for plugging into hopstop
	//alert('erroryet');
	startEndAddress = getStartEndAddress();
	startEndAddress[1] = startEndAddress[1].replace("%20","");
//	alert(startEndAddress[1]);
	if (startEndAddress[1] == "Brooklyn" || startEndAddress[1] == "brooklyn" || startEndAddress[1] == "Queens" || startEndAddress[1] == "queens" || startEndAddress[1] == "Staten Island" || startEndAddress[1] == "staten island" || startEndAddress[1] == "Bronx" || startEndAddress[1] == "bronx" || startEndAddress[1] == "New York" || startEndAddress[1] == "new york"){
		city = 'newyork';
		doHopStop = true;
	} else if (startEndAddress[1] == "Boston" || startEndAddress[1] == "boston" || startEndAddress[1] == "Cambridge" || startEndAddress[1] == "cambridge"){
		city = 'boston';
		doHopStop = true;		
	} else {
		var hopStopResponse = "Neither <a href='http://hopstop.com'>HopStop</a>, or <a href='http://google.com/transit'>Google Transit</a> are available in your area.  Sorry!";
		
	}
	
	
	// this code turns off the hopstop functions
	doHopStop = false;		
	var hopStopResponse = "Integration with HopStop is coming soon!";
	
	
	
	if(doHopStop == true){
	/*city = 'newyork'; 
	county1 = startEndAddress[1];
	address1 = startEndAddress[0];
	county2 = startEndAddress[6];
	address2 = startEndAddress[5];*/
	
	startStreet = startEndAddress[0];  //street address
	//city = startEndAddress[1]; // city
	city = city // city
	county1 = startEndAddress[1]; // count start
	address1 = startEndAddress[3]; // start zip
	endStreet = startEndAddress[5];  //street address
	county2 = startEndAddress[6]; // count start
	county2 = county2.replace(" ","%20")
	address2 = startEndAddress[8]; // start zip

/*			city = 'newyork'; 
			county1 = 'brooklyn';
			address1 = '11214';
			county2 = 'staten%20island';
			address2 = '10306';
*/			


	alert(city + county1 + address1 + county2 + address2);
	alert('http://therealcosts.com/hopstop.php?city='+city+'&county1='+county1+'&address1='+address1+'&county2='+county2+'&address2='+address2);
	
	// http://therealcosts.com/hopstop.php?city=newyork&county1=Brooklyn&address1=11238&county2=Staten%20Island&address2=10314
	
	//http://www.hopstop.com/ws/GetRoute?licenseKey=7tj0m3k4r01uiz8t&city=newyork&county1=Brooklyn&address1=11238&county2=Staten%20Island&address2=10314&day=monday&time=12&mode=a
				//alert('http://www.hopstop.com/ws/GetRoute?licenseKey=7tj0m3k4r01uiz8t&city='+city+'&county1='+county1+'&address1='+address1+'&county2='+county2+'&address2='+address2+'&day=monday&time=12&mode=a');
	GM_xmlhttpRequest({
		method: 'GET',  
		url: 'http://therealcosts.com/hopstop.php?city='+city+'&county1='+county1+'&address1='+address1+'&county2='+county2+'&address2='+address2,
	//	    url: 'http://www.hopstop.com/ws/GetRoute?licenseKey=7tj0m3k4r01uiz8t&city='+city+'&county1='+county1+'&address1='+address1+'&county2='+county2+'&address2='+address2+'&day=monday&time=12&mode=a',
	    headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/0.3',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
		
	    onload: function(responseDetails) {
	        var parser = new DOMParser();
	        var dom = parser.parseFromString(responseDetails.responseText, "application/xml");
//			var hopStopRoute = dom.getElementsByTagName('Route')[0].textContent;
			alert('http://therealcosts.com/hopstop.php?city='+city+'&county1='+county1+'&address1='+address1+'&county2='+county2+'&address2='+address2);
			var directions = new Array
			directionsAll = "";
			for(h=0; h<dom.getElementsByTagName('step').length; h++){
				directions[h] = dom.getElementsByTagName('step')[h].textContent;
				directionsAll += "<p>" + directions[h] + "</p>";
		}
			
		//	directionsAll = "<div id="directionsAll">" + directionsAll + "</div>";
			
		var hopStopRoute = dom.getElementsByTagName('step')[0].textContent;

		//this assigns the text of the route to the div with the id of hopStopResponse
		document.getElementById('hopStopResponse').innerHTML = directionsAll;
	    }
	    
	});

	// 	end get the hopstop.com info -- could not do in function b/c of weirdness  //
	
	} // end the hopstop if statement
			
	/*
	if avg car driving per person is x miles
	and avg distance of commute to work is 16 miles  // http://abcnews.go.com/Technology/Traffic/story?id=485098&page=1
	and the average worker commutes 5 days per week 50 weeks per year
	then avg miles driven to work is y miles / (5 days x 50 weeks)
	total miles drive (x miles) / avg miles to work= ratio of work to regular miles.
	*/
	
	yearlyTrips = 2 * 5 * 50; // round trip, 5 per week, 50 week per year
	avgToWork = 16;
	avgYearlyToWork = yearlyTrips * avgToWork;
	avgYearlyTotal = 12500;
	workLeisureRatio = avgYearlyTotal/avgYearlyToWork; // ratio of total driving to work driving
	yearCarbon = carbon * yearlyTrips * workLeisureRatio;
	yearMiles = milesCar * yearlyTrips * workLeisureRatio;
	airFactor = 1.36;
	//driveFactor = .971; //lbs CO2e/mi
	busFactor = .05;
	trainFactor = .12;  
	tonnes = 2204; //  lbs/tonne
	divisionFactor = 150/12500; // pixels / total lbs in scale
	
	// BEGIN CSS/HTML -- car div

	addGlobalStyle("body{ margin:0 0 0 0; padding:0 0 0 0; font-family:arial, helvetica, sans-serif; font-size:10px; color:#000; }  h1{ margin:0 0 0 0; padding:0 0 0 0; font-size:2.8em; font-weight:bold; }  h2{ margin:0 0 0 0; padding:0 0 0 0; font-size:2.2em; color:#8E0303; font-weight:bold; }  p{ margin:0 0 7px 0; padding:0 0 0 0; font-size:1.2em; text-align:center; }  a{ color:#fff; text-decoration:none; } #wrap{float:left;} #container{ margin:0; padding:10px 15px 5px 15px; float:left; width:685px; background-color:#FF8B19; -moz-border-radius: 20px; -webkit-border-radius: 20px; }  #co2{ margin:0 0 0 0; padding:0 11px 0 0; float:left; width:112px; height:62px; border-right-width:5px; border-right-style:solid; border-right-color:#fff; }  #co2_lbs{ margin:0 15px 0 11px; padding:0 0 0 0; float:left; width:84px; height:62px; text-align:right;  }  #num{margin:0; font-size:3.5em; color:#8E0303; font-weight:bold; letter-spacing:1.5px; }  #image_caption_wrap{ margin:0 0 0 0; padding:0 0 0 0; float:left; } img{margin:0 0 5px 0;} .image_caption{ margin:0 15px 0 0; padding:0 0 0 0; float:left; line-height:10px; width:66px; }  .image_caption_last{ margin:0 0 0 0; padding:0 0 0 0; float:left; width:110px; } .image_caption a:hover{text-decoration:underline;} .image#car_mpg{margin:0 0 0 0; padding:0;float:left;}  p.text{ margin:0; padding:0 0 0 0; text-align:left; font-size:1em; line-height:13px; width:131px; }  a.changeCar{ font-weight:normal; text-decoration:none; color:#fff; }  a.changeCar:hover { text-decoration:underline; }  #selectCar{display:none; margin:0 0 15px 0; padding-bottom:10px;width:100%;font-size:1.2em; float:left; color:#8E0303;font-weight:bold;border-bottom-width:3px;border-bottom-style:solid;border-bottom-color:#fff;} #year{margin:0 20px 0 0;padding:0;}#make{margin:0 20px 0 0;padding:0;}#model{margin:0 20px 0 0;padding:0;} .formTitle{margin:0 0 15px 0;font-size:2em;}.formText{font-size:1.8em;} #carboninfo{margin:8px 0 0 0; padding:10px 15px 5px 15px; float:left; width:659px; height:127px; background-color:#fff; -moz-border-radius: 20px; -webkit-border-radius: 20px; border-color:#FF8B19; border-style:solid; border-width:13px; display:none} .mc{width:120px; height:125px; float:left; padding:0 0 0 5px;} h2{color:#8E0303; font-size:28px; text-align:left; width:350px; float:left; } .milage{font-size:14px; color:#FF8B19; text-align:left; padding:17px 10px 5px 0; margin:17px 0 0 0; width:170px;} .miles{font-size:33px; color:#8E0303; font-weight:bold; text-align:left; margin: 0 0 2px -2px;} .mc2{width:140px; height:125px; float:left; padding:0 0 0 40px;} h2{color:#8E0303; font-size:22px; text-align:left; width:350px; float:left; } .offset{width:93px; height:20px; background-color:#FF8B19; float:left; margin:75px 15px 0 0; -moz-border-radius: 15px; -webkit-border-radius: 15px } .offsetp{padding:3px 0 0 0; } .offsetp a{text-decoration:none; } #reduce{border-style:solid; border-color:#FF8B19; border-width:0 0 0 14px; padding:10px 0 0 16px; float:left; width:200px; height:145px; margin:-10px 0 0 0;} a:visited{color:#fff; text-decoration:none;} .bus{color:#FF8B19; margin:20px 0 0 0; padding:12px 0 0 0; height:120px; font-size:14px; text-align: left; line-height:26px;} #businfo{margin:8px 0 0 0; padding:10px 15px 5px 15px; float:left; width:659px; height:127px; background-color:#fff; -moz-border-radius: 20px; -webkit-border-radius: 20px; border-color:#FF8B19; border-style:solid; border-width:13px; display:none} #carpoolinfo{margin:8px 0 0 0; padding:10px 15px 5px 15px; float:left; width:659px; height:127px; background-color:#fff; -moz-border-radius: 20px; -webkit-border-radius: 20px; border-color:#FF8B19; border-style:solid; border-width:13px; display:none} #bikeinfo{margin:8px 0 0 0; padding:10px 15px 5px 15px; float:left; width:659px; height:127px; background-color:#fff; -moz-border-radius: 20px; -webkit-border-radius: 20px; border-color:#FF8B19; border-style:solid; border-width:13px; display:none} .bus a{color:#FF8B19;} .bus a:hover{text-decoration:underline;} .image{margin:-15px 0 0 0;} .milage a{color:#FF8B19;} .milage a:hover{text-decoration:underline;} .mc3{width:238px; height:125px; float:left; padding:55px 0 0 50px;} #carpoolinfo .mc{width:408px;} #bikeinfo .mc{width:408px;} .carpool li{color:#FF8B19; margin:0 0 0 0; font-size:14px; list-style-type:none;} .carpool a{color:#FF8B19; display:block;} .carPool{float:left; width:190px; margin:-25px 13px 0 0;} .carP{width:170px; font-size:14px; color:#FF8B19; text-align:left; padding:17px 10px 5px 0; margin:17px 0 0 0;}");
	if (cookieSet == false){
		addGlobalStyle("#selectCar{display:block;");
//		carbon = '^';
		mpg = 'Choose Car';
	}
	headerCode = '<div id="container"><div id="selectCar"><span class="formTitle">Select Your Car:<span name="car" id="car"> Fleet average is 24.7 </span>MPG</span><form action="javascript:get(document.getElementById("myform"));" name="myform" id="myform"><span class="formText">Year: </span><select name="year" id="year"><option label="none" value="none" selected>Select</option><option label="2007" value="2007" >2007</option><option label="2006" value="2006" >2006</option><option label="2005" value="2005" >2005</option><option label="2004" value="2004" >2004</option><option label="2003" value="2003" >2003</option><option label="2002" value="2002" >2002</option><option label="2001" value="2001" >2001</option><option label="2000" value="2000" >2000</option><option label="1999" value="1999" >1999</option><option label="1998" value="1998" >1998</option><option label="1997" value="1997" >1997</option><option label="1996" value="1996" >1996</option><option label="1995" value="1995" >1995</option><option label="1994" value="1994" >1994</option><option label="1993" value="1993" >1993</option><option label="1992" value="1992" >1992</option><option label="1991" value="1991" >1991</option><option label="1990" value="1990" >1990</option></select><span class="formText">Make:</span> <select name="make" id="make"></select><span class="formText">Model:</span> <select name="model" id="model"></select></form></div><!--end form--><div id="co2"><h1 style="color:#fff;">CO2 for this trip:</h1></div><div id="co2_lbs"><p id="num">'+carbon+'</p><h2>lbs CO2</h2><span id="hiddenMiles" style="display:none;">'+milesCar+'</span></div><div id="image_caption wrap"><div class="image_caption"><a href="javascript:expandCarbonInfo();"><p style="margin:0; padding:0;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAwCAYAAAClvqwiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+xJREFUeNrsmz9ME1EYwL/7A+1icZEFiAw6oCQSSDTpoiSSOCHBgcVIFxcTjU6YOMggiaP/omshOjhIkEUSDNaFBBMIJiiDJpJAF5woC7S9O7/v2dJL6fUe7XvXO9ovuVwKd4/3fu/734cCnGJZ1gW8nYSAiaIoX7meK7Pwy3iL4TUURAAlJIFXHK8ZhLPjCgIBnM69cAWOp2zgdR9hfHQEkVP/xDHRADd5hjAeHAJRZxDyQprxvBjEH7x1Qv1JD8L4ruQgPMbbONSnJBBEv1IrbbD2UmD8nsfrM1g7SbD+roNyqguUljbQzlzFawCUcMQ7rcj5hlUvIWQWX0B2GQPT/q7zQ6EToPfFoCl6z4spjROI0Vy49EQL9t/fZLvPnRChljQPvQa1pV2qeahemUQlENh7+Pz+1CCYO1tS56d6ZQ6VQCi8vAvpmTsMZqBBkE+oGIJNM7Ir8eCCoF1kjlGAZBdfSjMR6SDYLpaLDkcdbzkeTBDG2rTQ8UzMO2SILitRslJJ0M4Ps7vQ8XE8c/snqK3n/AvC+DUPmS8TbLIqZodqR1LK7pnb6/4FkV37AJm5hwWba+0Cc3NJjgNOJf3pIwxcsB1CEEUIiMynscCXoKoIkyilqsyOOy7JmTTWH74DYTiEMyqtlUibFBBUqvsOhFNcZ/2FUEQ4DBqPIoboukNqQkX5hNY9LHbCGJYpTO+96oM0+iZRQKoCYbiER+PHNOi9MdZkERbv+2IHxReNz6paATCqAqG5OENz8xuYaCI0eSEQonf/Z5Y4rt0E03Nj/jYNFloXJli7TanS09P7NA6NV8pPUdpdUxBqx0XXPgLZcmjkbcUw6D16P73wxLGvYVRZjFUNggorV1+Ctkx2TYtxA+cEgXW8VybLmOFSbUHo3Te4QiQ1Vagga77+Bpr6H7k7UOpio08Ij86yDpfsFF6Ij2AL44ky5OWnBhm48O0ENF17ekhD6DP9nH5Pmene5GBZTSjkF+21B6GdHWCT560cyctbqS2mTcVpOH1mWhaOMMfI2+ukatcXUYMmz2C4qDzteOjWLFc/QedNxvBv8vgqz8InwWAqX8IH5FU+NPKO+8sayj94Ig0Lz1V+PSg8j6AJ0QKKVVXHyRKoo4pb2NV6R4UkbMJ7ljLAEgwKv9QIzpf8pGEEVxNU6qsQACEYpP72Ak4khDyIDWgIA7HawAAJnY7NWJZFWtFZE7WnRostqZLV1XKRmbyzpAJ/XOTIFNftyZLTAimS8EYTlmxFhQNLHJyhYhlf4zDZAYjG8cI6hVH6wKkNRuMIchGQY3koHQGUrOmVo46W0xhyqj0+BUQ7vsH77wl5+SfAAHvPpNW6FcqIAAAAAElFTkSuQmCC" width="66" height="48" border="0"></p><p style="color:#fff;">offset trips<br />carbon </p></a></div><div class="image_caption"><a href="javascript:expandBusInfo();"><p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAvCAYAAABXPhxsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3JJREFUeNrsmr9rFEEUx2f27rxYXLQxjQYtbDQBDwuFNObAQhsJsbARY2uhKAgKFqYRTBeTfyABG4uEaKNgwLURDCgGolckYMCkORvvUni/1/f2Zi+zt3dJ9vbNune3DyYLm2Sy+7nve/N9k+HsgGEYxjm4HGUdFpzzjwf6uT1e/BJcbsMY60QATUKHMQdjCeBk9wUBAE6KXxhl3RmbMO4DjNctQQj5612igP1iGmA8cIDoMQhWoDJeNIL4CZdTrPciCTBWowLCU78gVDM/YKSZkdtmRj7HjN/p+ve0wYv1K+8/zrQjJ3xJERgprloN+OKVjWVW/fUZxoq7X44nTCgRHEPjjPf1q1OFqA3fqGeuwIuXP83YXl4bvOBqDiO7bSrHCoQRSz1RAWQSQUyI5ZIsymsLrPTuse1edOQui43ccz1Xfv6aLX1QJfFbb6jTRtdUpETpw7Omn67bwBrCCjn7zcIOKG2WPDeiKlICH9Zx//si+wuD5G9svIevU8EGwfK7nyBW/sjwOMm0qA6EaUJuAjpwIKpSPseuTpkVnyzloEhaaYHKo5xbowYh1wLt2BnaThIUpiroQeS2dh+ceJnj0kqBviTQqWEpgrepBjRgJZQ/rBZopuQlV1aYkc8FHIQwQLwv0V4dAAhVcKK1T32FRU5fZtrAWYfCbN4iaKlRzW45+gbX0eAbsC+xpYdQhZHfCS4I2Q63/UAyQNFr2EAIpQVaEUYm7UkRZoO2vmy361/mWoKirBO0IAreHqzw6qb9kwbjVPk674DRzLMEz1laNnitDTvdwjGWYS4+UKsNjYoJPgiwwxWi3gJVUgS1qAyNhRGCCEH4DUIDV8iJGi9zz5K4ifOlWMauPGfR4evCNs942lU6dONlveUuvn1EVoR9UYQFwZPdFu5S3neg2ujxDURFapONjAfjA94CHaeq9lt5ahSX7ph5bbpDj1JGx0k1l+8gLHscuLnC5TMEEYJwE1z8J3ySesVobJIOP1z/73PtEXqoCCk1NjvqieMJZSDIjwSgE5T7gsj5Cbq5hpQ4S13pQRHMb44bsGI7vt3AvUnclqOYq0UkLRDkBbODQuecp8LDZOIwmbxq4AnbPz0GAY8XrtoMlbgx2kMwpq0zlg5nKWAkWe3gabcG2oUx+dSt+e4tK3WXHkoHAE3b2H8CDAA/DHENGKo6SgAAAABJRU5ErkJggg==" width="66" height="47" border="0"><p><p style="color:#fff;">take a bus<br></br>or subway</p></a></div><div class="image_caption"><a href="javascript:expandCarpoolInfo();" ><p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAvCAYAAABXPhxsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABFRJREFUeNrsWj1MFEEUnt1bOC04bLRBooUUKIkEEkloxIJWLjQWGr3aRKKJCSYW0tBZIBptT2JDIYFKEo2eDYkkGklQCkwkARps5Czgftf35nb2Zmf34I59exx3vGSyc7e3Mzvf+/vm3WisTDFN8zJcTrEjJpqmfS7rd3ss/CpcYtCiRxEAD0lAi0ObBXC29wUCADhnPTDA6lPWoN0HMOZKAmGZf6JOLGA/mQAwHriAaDAQhKBlPFOB+A2X86zxpBvAWNItEJ40KAjcRWyLaGBrsK3CsGJD1UAwd5Ms/2eF9/PrXxz39NOdjJ2IMC3SxvTWs9UEImogGkHOkIPF5kXbAgBS/8p+Vm+/wjQARz8Drb0vSHAGjCCsIbf6nmV/zLD8rw++xsmvLzIGLSdSHIBidA2z0KVhpoHlkDJQK1COUWk/83GcmZbpBybhFtbUP8KM3hgZ69QprSA9fSt4EFDAvTKfxln63SjZkGRApOdHWbUlB+6XUwLuQcWgcgkRBMO35yC4XQxs8fmtnyw1NVSce3mGhSCQ1oRFiDTI016AIPAXhvFxHnXumrAIG4jWNmfm+BYvTNITY6GOwYo1j3HA63kN0qmZ3CzwErgiN/GbRYgsYtHK+32OmIHfYxPxA18Y3QivXkRLvpeevVt8fg762xuSVXR6KuJQgZCDFWeGUmSX+7iQ1NR1nlm8Aqt6T2jcBkr67JhHeYdDA8LcKqZL2TWQFcp9ZIVmqqBtc3vTPY5yL9RzpzguLFwOiPI8/BmClO0fiFTSEciEf8uLxT5qTQtHHK4g97VIkT5nl986WKmZ3GCZhUnXPKRBmGwgyQLQv2VTxj4nWyLAgQZFIEXBoCi0itfM/COna4BrZReeO91Qmq+mgBAa5QEvuVl2phEaL0cywCTRMlQLqpn0WXCHFc9ssB9wFbkhAIyWIeZTs1ZNAIEmvfuityJ6vAPtICLAqCnXoGJ2hy06O5aAgAi38LwfyMsSZ4pAYoQgPuEbbzjv57tESJmVlOZKB9Y21gzjIimjHDcwi2jqv2dvfpD0YEmNRFu9MbteieN6Vab80mxSIGSW6dpvUM5TQZquXtaQ8jkyRKGZ7Nc4T5EUgiRKjItXqnFJYwRuiW1CAxaAVFoNcEb/CN+cIVBN1x7zegL+Dl0n1DXMq0y4OIwD6u+yAALfiivjqjFE9xmgfVtE89ArnilKZxGfZfcynm+OvvRdmCEp56O57qWxIMWAAI2lfZ9CU87HWgG+ULUF0zUBCHQW4UgU0zddmyC/Wtt52uH67uTDVUpMEwEwy4hnMDsKFHuN1GcVssPLbBcG/bmeVLbz+kzlGngs4DvloFioxXSIloAgUPxhi38P4HECrJRT/KGjyNjxQZGCdIsYEW9gEBJ4hur4MJl8mMwSPGH7t8FAwOOFSw6KbX0x0EBgTIgzlq69hgUGnqlK1DEASBei8qlbvvaSe/46PZQOALz2uvlfgAEAE08Zk+T410EAAAAASUVORK5CYII=" width="66" height="47" border="0"><p><p style="color:#fff;">carpool</p></a></div><div class="image_caption"><a href="javascript:expandBikeInfo();"><p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAvCAYAAABXPhxsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABMBJREFUeNrsWjFME1EYfnctbRcLiy5oZMABJbFiogmLkEiCixAcWEzEwUETTZwgcRAHE9mIJjA4WIwODmrjIgkkMJFIAsEEdYABAiw6aMtCodfz/97dO9pydz169Cg9/uTRlOuV9773/d///Y+TmE2oqtpFLzF91LGjGQs0VmhMS5L03fFdtPhaGk9p/FWrL6ZoXDNbt1QAwkV6SdBoYNUdw8SOx6ZA6CBMH+EU2G/ECYy7eUAgHfQ88gsIIgYJjGe5QLyhlz7mz2ggMFZlAuGsj0HgrMAPmUY383d0CyDafA5EHUpqsFIEMvv7J8vMjTE1tc6kk00seLmPybWnPfv7wUoBIf3hNmPpTe0Xa7NM+fGJRe5NMykS9WIKbXIlAKEsT+6CIILeAwyvQmbHcbipkVn8aOy4FCUtCJ/IYwV0InChp7qB2P7aX0D7Wb5oqbZeAyEc1d57ow/eA6Fupdj2eD/LQhMKdYKACfW+Y4EzVw+FobKXIKAymIFgMCVxn3+uaoHg5fHtTab++WX+AeiDXinAmKoUyz0eoSBqOl+wQGOHBlRqgzMGGiL0Im+yLX1l041g+ZnQZcmCUOcQC5zr4G9D3SPGZ+38Q03ro6MHhGKjB6Hu0TxhlE+dZ6GuEZaZj1sAR5Wk8frRTA0pWm8rjEiJYOtDo6cAOwRDqkosg823+EINMTSx0OnX7VwTDqtaeFY1kNNoniwB0TXBy76ibKmhrH1jyiItZnki3yZTasiU12ipAQhUHxqQmYvvqSJq2pwRytIEyxBIWfobxj0EqEz6As0A6w4kjXHWX+rhDOi8M/OSKfNjGr1oYvKppt2qQZPPUkvNESdG5Co+eo2d8YHdHSm4nk2u0/V+7X594eK71eQG/26UW4CNigOxdRGDrhgBfwCTBABq2p+YHqRgQduJBywz84ovIHRjyNCPXCCsvAcAsvIPYBY2AmXXrT0vWSMwAYCA5ihMpdDqNAm/j9z5Qjt6hesAmFC8KRvgIMBsgSVWJgopFyYAwBi39lwuNSWwG5yW+g4Xi1DXKJ8wmGGrN6QJAmAn+Y+U4ClFwFl6kHIBkUXPANrSjjgWo0iU+wZuo4n6xUwYrzJOFR/zIJCVpUmPgYCCY3E5wugIDL1/UC36Dn4ttW6k1L4WQnOxbOrKBYRwjGpyvWKO2tStTUufUjYgRBkTpdGx39CpK9QdvQVElOtBi5Zmsn4NWuGYobQhvHp5XTUgUKIKKHqaFAuIqxBBEegrwr3vueCKyiCu76DcOqwCO1PPtXtdNGUll0/4BlG2ioHBzRMmS5/n99lNiLQBQgnQcEhTDAz0KTjDwMa4cZmunCXoy0+USPywk4HmnjxTw+0xlTThDlHznTpAccALPQIwqDiCNQAHdp7/Z4wAw4k3vtvFoc2gKyBEfsIb2DVNAAlM2O9EASSYhJJrdbgj+hiX4R6IXECE/zdoTjsFAXN7vKbwniU//fDdB3h20QYgPrPjRwNiEMtpn4PwD48dAoi4z4FI8FQjNJL0OuxXNrCcR4eY/mbBh0DgqbpV7iMMr+7z5ywNZ6k/pxzzCTMGc0HYY7FBExqXmPa44UqVCmNMPGSat3bb1lZLl2rwGNjUhF4YTOO/AAMAsJgHKBtnm5oAAAAASUVORK5CYII=" width="66" height="47" border="0"><p><p style="color:#fff;">bike</p></a></div><div class="image_caption_last"><div id="logo"><p style="margin:0;"><img src="data:image/png;base64,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" width="110" height="37" border="0"></p></div><!--logo--><div id="car_mpg"><p class="text"><a href="javascript:expandCar();" class="changeCar">Your Car:<span id="smallMpg">'+ mpg + '</span> MPG<br/>Change Your Car </a></p></div></div><!-- img_caption_last--></div><!--end image_capt_wrap--></div><!--container--><!--BEGIN CARBON DIV--><div id="carboninfo"><div class ="mc"><h2>If this is your daily commute</h2><p class="milage"><strong>Annual milage is</strong></p><p class="miles">'+yearMiles+'</p><h2>miles</h2></div><!--end mc--><div class="mc2"><p class="milage"><strong>Your annual CO2 is</strong></p><p class="miles">'+yearCarbon+'</p><h2>lbs CO2</h2></div><!--ends mc2--><div class="offset"><p class="offsetp"><a href="http://www.terrapass.com/road/index.html" target="_blank">OFFSET THIS</a></p></div><!--offset--><div id="reduce"><h2>Reduce This</h2><p class="bus"><a href="javascript:expandBusInfo();">Take the Bus!</a><br></br><a href="javascript:expandCarpoolInfo();">Carpool, its fun!</a><br></br><a href="javascript:expandBikeInfo();">Ride a Bike</a></p></div><!--ends reduce--></div><!--END CARBON INFO--><!--BEGIN BUS DIV--><div id="businfo"><div class ="mc"><h2>Take the bus or subway</h2><p class="milage"><strong>Map your route with:</strong></p><p class="image"><a href="http://www.google.com/transit"><img src="http://mashable.com/wp-content/uploads/2007/06/logo-google.thumbnail.gif"></a></p></div><!--end mc--><div class="mc3"><p class="image"><span id="hopStopResponse">'+ hopStopResponse +'</span></p></div><!--ends mc3--><div id="reduce"><h2>Bus Links</h2><p class="bus"><a href="http://www.urbanrail.net/index.html">Urbanrail.net</a><br></br><a href="http://www.apta.com/links/state_local/">US Local/State Transit Links</a><br></br><a href="http://www.railserve.com/Passenger/Europe/">European Transit</a></p></div><!--ends reduce--></div><!--END BUSINFO--><!--BEGIN CARPOOL DIV--><div id="carpoolinfo"><div class ="mc"><h2>Find A Carpool</h2><div class="carPool"><p class="carP"><strong>US & Canada:</strong></p><ul class="carpool"><li><a href="http://carpoolconnect.com/">Carpool Connect</a></li><li><a href="http://www.erideshare.com/">eRideShare.com</a></li><li><a href="http://www.ridecheck.com/ridecheck/">RideCheck</a></li></ul></div><div class="carPool"><p class="carP"><strong>International:</strong></p><ul class="carpool"><li><a href="http://www.compartir.org/">Compartir</a></li><li><a href="http://www.freewheelers.com/">Freewheelers.com</a></li><li><a href="#"></a></li></ul></div></div><!--end mc--><div id="reduce"><h2>Carpool Facts</h2><p class="bus" style="line-height:16px;">Cut your emissions in half... and cut your costs in half, while going faster in the carpool lane.  Less emissions, less stress.</p></div><!--ends reduce--></div><!--END CARPOOL--><!--BEGIN BIKE DIV--><div id="bikeinfo"><div class ="mc"><h2>Find A Bike Map</h2><div class="carPool"><p class="carP"><strong>US Cities:</strong></p><ul class="carpool"><li><a href="http://www.libraryspot.com/maps/bike.htm">US City Bike Maps</a></li><li><a href="http://www.nycbikemaps.com/">New York City Bike Maps</a></li><li><a href="http://www.bikemap.com/bikesontransit/index.php">Bikes on Transit</a></li></ul></div><div class="carPool"><p class="carP"><strong>International:</strong></p><ul class="carpool"><li><a href="http://www.bikely.com/">Bikely.com</a> <span style="font-size:10px;color:#666;">An international site where bicyclists share good bicycle routes, both for commuting and for recreation</span></li><!--<li><a href="#">Link 2</a></li><li><a href="#">Link 3</a></li>--></ul></div></div><!--end mc--><div id="reduce"><h2>Bike Facts</h2><p class="bus" style="line-height:16px;">Using a bicycle to commute 4 days a week for 4 miles (each-way) saves 54 gallons and 1275lbs of CO2 of gas annually.</p></div><!--ends reduce--></div><!--END BIKE INFO--><br />';


	// END CSS/HTML -- car div

	var target, header;
   	header = document.createElement('div');
   	header.innerHTML = headerCode;

   	
    if(getHeaderId(href) != 'notcar'){
		targetId = getHeaderIdCar(href);
	}
	
	/*	if(isString(targetId)){
		target = document.getElementById(targetId);
	   	target.parentNode.insertBefore(header, target);
	} else 
	*/	
	if(1 < targetId) {
		mybody = document.getElementsByTagName("body")[0];
		target = mybody.getElementsByTagName("table")[targetId];
	   	target.parentNode.insertBefore(header, target);
	} else if(1 == targetId || isString(targetId)){
	  	header.setAttribute("style","position:fixed;z-index:99;top:15px;left:15px;");
		document.getElementsByTagName("body")[0].appendChild(header);	
		document.getElementById('container').style.opacity = .7;
		var listenContainer = document.getElementById('container');
		listenContainer.addEventListener("mouseover", changeOpacity, true);
		listenContainer.addEventListener("mouseout", resetOpacity, true);
		
	}

	//add event listeners for the form
	var listenYear = document.getElementById('year');
	listenYear.addEventListener("change", yearChange, true);
	var listenMake = document.getElementById('make');
	listenMake.addEventListener("change", makeChange, true);
	var listenModel = document.getElementById('model');
	listenModel.addEventListener("change", modelChange, true);
}


// functions that do the ajax request to get the mpg

function yearChange(){ 
	if(year = document.getElementById('year').value){
		getFuelEconomy(year);
	}
}

function makeChange(){ 
	if(make = document.getElementById('make').value){
		getFuelEconomy(year, make);
	}	
}

function modelChange(){ 
	if(model = document.getElementById('model').value){
		modelArray = model.split(/ - /);
		getFuelEconomy(year, make, modelArray[0], modelArray[1]);
	}	
	
}

// getHopStop


// changes opacity of header

function changeOpacity(){ 
    document.getElementById('container').style.opacity = 1;
}
function resetOpacity(){ 
    document.getElementById('container').style.opacity = .7;
}



// get RSS/XML

function getFuelEconomy(year, make, model, type){   //(startnumber, numberFeeds, feedlocation){
	var str = '';
	var modelTest = '';
	str += 'year='+year;
	if(make){
		str += '&make='+make;
	}
	if(model){
		str += '&model='+model;
		modelTest = model;
		if(type){
			str += '&type='+type;
		}
	}
	//alert(str);
	GM_xmlhttpRequest({
	    method: 'GET',
	    url: 'http://map.therealcosts.com/economy/fueleconomy.php?'+str,//year=2007&make=TOYOTA&model=PRIUS',
	    headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/0.3',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
	    onload: function(responseDetails) {
			//alert(responseDetails.responseText);
	        var parser = new DOMParser();
	        var dom = parser.parseFromString(responseDetails.responseText,
	            "application/xml");
			var insertString ='<option label="none" value="none" selected>Select</option>';
		    
			if(modelTest != ''){
				//GM_setValue("year",  dom.getElementsByTagName('comb')[0].textContent);
				
			 	 GM_setValue("year",  dom.getElementsByTagName('year')[0].textContent);
				 GM_setValue("mfr",  dom.getElementsByTagName('mfr')[0].textContent);
				 GM_setValue("model",  dom.getElementsByTagName('model')[0].textContent);
				 GM_setValue("type",  dom.getElementsByTagName('type')[0].textContent);
				 GM_setValue("guzzler",  dom.getElementsByTagName('guzzler')[0].textContent);
				 GM_setValue("city",  dom.getElementsByTagName('city')[0].textContent);
				 GM_setValue("hwy",  dom.getElementsByTagName('hwy')[0].textContent);
				 GM_setValue("comb",  dom.getElementsByTagName('comb')[0].textContent);	            										   		
				 
				fullCar = dom.getElementsByTagName('year')[0].textContent+' '+dom.getElementsByTagName('mfr')[0].textContent+' '+dom.getElementsByTagName('model')[0].textContent+': '+dom.getElementsByTagName('comb')[0].textContent;
				GM_setValue("car",  fullCar);	            										   		
				
				document.getElementById('car').innerHTML = fullCar; 
				thisTrip = document.getElementById('hiddenMiles').innerHTML; 
				newCarbon = Math.ceil(10 * thisTrip * 1/dom.getElementsByTagName('comb')[0].textContent * 23.6)/10; 
				document.getElementById('num').innerHTML = newCarbon; 
				document.getElementById('smallMpg').innerHTML = dom.getElementsByTagName('comb')[0].textContent;
				
			}else if(make){
				var model = dom.getElementsByTagName('model');
				var type = dom.getElementsByTagName('type');
				lastModel = '';
				lastType = '';
				for (var i = 0; i < model.length; i++) {
					if(lastModel != model[i].textContent || lastType != type[i].textContent){	
						insertString += '<option label="'+ model[i].textContent + ' - '+ type[i].textContent +'" value="'+ model[i].textContent+ ' - '+ type[i].textContent +'" >'+ model[i].textContent+ ' - '+ type[i].textContent +'</option>';
						lastModel = model[i].textContent;
						lastType = type[i].textContent;
					}
					
				}
				document.getElementById('model').innerHTML = insertString;
			
			}else if(year){
		    	var mfr = dom.getElementsByTagName('mfr');
				for (var i = 0; i < mfr.length; i++) {
					insertString += '<option label="'+ mfr[i].textContent +'" value="'+ mfr[i].textContent +'" >'+ mfr[i].textContent +'</option>';
				}
				document.getElementById('make').innerHTML = insertString;
			
			}else{
				alert('the fuel economy request failed')
			}
	    }
	});
}//end getFuelEconomy

function getStartEndAddress(){
	var startCityStateZip = new Array
	var endCityStateZip = new Array
	startStreet = "none";
	endStreet = "none";
	site = stripHref(window.location.host);
	if (site =="maptherealcosts" || site == "mapquest"){
		startAddress = document.getElementById('mqaddress-start').getElementsByTagName("span");
		// do it contingent to see if only locality
		if(startAddress.length == 5){
			// this is if there is a whole address, including street address
			startStreet = startAddress[2].textContent; // assign start streeet
			startLocality = startAddress[3].textContent; // assign city/state/zip
			//alert(startLocality);
		} else if(startAddress.length == 3){
			// this is if there is just a city, state, zipcode.  no street address.
			startLocality = startAddress[1].textContent;
			//alert(startLocality);
		}
		
		startLocality2 = startLocality;
		
		startLocality = startLocality.replace(",","");
		startCityStateZip = startLocality.split(" "); // split into array
		
		city_plus_statezip = startLocality2.split(","); // split into city, state+zip, US
		state_zip = city_plus_statezip[1].split(" ");// split into state, zip,
		// there is a space at the front of city_plus_statezip[1], so skip to state_zip[1] for state
		//alert(city_plus_statezip[0]);// + state_zip[1] + state_zip[2]);  
		
		//alert(city_plus_statezip[2]);
		
		startCityStateZip[0] = city_plus_statezip[0];
		startCityStateZip[1] = state_zip[1];
		startCityStateZip[2] = state_zip[2];
		startCityStateZip[3] = city_plus_statezip[2].replace(" ","");
		
		endAddress = document.getElementById('mqaddress-end').getElementsByTagName("span");
		if(endAddress.length == 5){
			endStreet = endAddress[2].textContent; // assign end street
			endLocality = endAddress[3].textContent; // assign end city/state/zip
		} else if(endAddress.length == 3){
			endLocality = endAddress[1].textContent;
		}
		endLocality = endLocality.replace(",","");
		endCityStateZip = endLocality.split(" ");
		endCityStateZip[3] = endCityStateZip[3].replace(",","")
		
	}else if(site =="randmcnally"){
		startAddress = document.getElementsByTagName("table");
		var startEndAddress = new Array;
		j = 0;
		const addressRegex = /You are at/ig;
		for(i=0; i<startAddress.length; i++){
			if(startAddress[i].className && startAddress[i].className == "siteText"){
				if (addressRegex.test(startAddress[i].textContent)) {
						startAddress[i].textContent = startAddress[i].textContent.replace(/\d+/,"");
						startEndAddress[j] = startAddress[i].textContent.replace("You are at ","");
						j++;
				}
			}
		}
		
		
		splitStartAddress = startEndAddress[0].split(",");
		startStreet = splitStartAddress[0];
		startCityStateZip[0] = splitStartAddress[1].replace("%20",""); // city
		startCityStateZip[0] = startCityStateZip[0].replace(" ","%20"); // city
		startStateZip = splitStartAddress[2].split(" ");
		startCityStateZip[1] = startStateZip[1];
		startCityStateZip[2] = startStateZip[2];
		startCityStateZip[3] = startStateZip[3];
		

		splitEndAddress = startEndAddress[1].split(",");
		endStreet = splitEndAddress[0];
		endCityStateZip[0] = splitEndAddress[1].replace("%20",""); // city
		endCityStateZip[0] = endCityStateZip[0].replace(" ","%20"); // city
		endStateZip = splitEndAddress[2].split(" ");
		endCityStateZip[1] = endStateZip[1];
		endCityStateZip[2] = endStateZip[2];
		endCityStateZip[3] = "";
		



	//	startEndAddress[0] = startEndAddress[0].replace("FROM:","");
	//	splitStartEndAddress = startEndAddress[0].split("TO:");
		
	//	alert(splitStartEndAddress[0]);
	}

    var startEndAddress = new Array
	startEndAddress[0] = startStreet;  //street address
	startEndAddress[1] = startCityStateZip[0].replace(",",""); // city
	startEndAddress[2] = startCityStateZip[1].replace(",",""); // state
	startEndAddress[3] = startCityStateZip[2].replace(",",""); // zip
	if(startEndAddress[3].match(/-/)){
		tempStartZip = startEndAddress[3].split("-");
		startEndAddress[3] = tempStartZip[0];
	}
	startEndAddress[4] = startCityStateZip[3].replace(",",""); // country
	startEndAddress[5] = endStreet;
	if(isNaN(endCityStateZip[3]) || endCityStateZip[3].length != 5) {
		startEndAddress[6] = endCityStateZip[0].replace(",","");
	//	alert(startEndAddress[6]);
		startEndAddress[7] = endCityStateZip[1].replace(",","");
	//	alert(startEndAddress[7]);
		startEndAddress[8] = endCityStateZip[2].replace(",","");
		startEndAddress[9] = endCityStateZip[3].replace(",",""); 
	} else {
		
	//	alert(endCityStateZip[3]);
		startEndAddress[6] = endCityStateZip[0].replace(",","") + "%20" + endCityStateZip[1].replace(",","");
	//	alert(startEndAddress[6]);
		startEndAddress[7] = endCityStateZip[2].replace(",","");
		startEndAddress[8] = endCityStateZip[3].replace(",","");
		startEndAddress[9] = endCityStateZip[4].replace(",",""); 

		
	}
	if(startEndAddress[8].match(/-/)){
		tempEndZip = startEndAddress[8].split("-");
		startEndAddress[8] = tempEndZip[0];
	}
//	startEndAddress[8] = startEndAddress[8].replace("-","%2d");
	
	return(startEndAddress);

}

////// End Car Functions ?????????????????????????????


// returns true if var is a string

function isString(a)
{
    return typeof a == 'string';
}

//////	Begin functions to deal with URLs

function stripHref(href){
	site = href.replace(".ca","");
    site = href.replace(".com","");
    site = site.replace(".edu","");
    site = site.replace(".net","");
    site = site.replace("www.","");
    site = site.replace("ww3.","");
    site = site.replace("ww1.","");
    site = site.replace("ww2.","");
    site = site.replace(".de","");
    site = site.replace(".com.au","");
    site = site.replace(".com.pg","");
    site = site.replace(".cz","");
    site = site.replace(".no","");
    site = site.replace("-","");
    site = site.replace(".","");
    site = site.replace(".","");
    site = site.replace(".","");	
    return(site);
}


// retreives the correct Id to insert before from an Array, keyed by URL
function getHeaderId(href){
	
	site = stripHref(href); //////	formating the url into the form we want
	var headerId = new Object;
  

	// this is the array that contains the Element Id of the Element before which
	// we will put in the Header.  for each site, add an Id
	
	//////	this is info hard coded from looking at the source code of these sites and acertaining where the header should go
	headerId.aa="aa-lang-en"; //////	updated 1/16/12
	//headerId.alaskaair= "FormUserControl_avl__lowFarePanel";
	headerId.ata="pricingSpan";
	headerId.ataairlines="pricingSpan";
	headerId.bookaircanada="business";
	headerId.continental= "ctl00_bodyMain";
	headerId.delta="booking"; //////	updated 1/16/12
	headerId.expedia="xp-hdr"; //////	updated 1/16/12
	headerId.jetblueairways=9;
	headerId.flsdoubleclick="why am i getting an error on jet blue with this url";
	//headerId.jetblueairways="header";
	//headerId.kayak="headerspace";
	//headerId.midwestairlines="Table18";
	headerId.orbitz="dialog";  //////	updated 1/16/12
	headerId.priceline="tripfilter";
	headerId.resnwa="signInLink";
	headerId.testtherealcosts="flightSummary";      
	headerId.ticketsairtran="progress";
	headerId.traveltravelocity= "bungee_v1";  //////	updated 1/19/12
	headerId.travelunited="bodymain";  //////	updated 1/16/12
	headerId.usairways="pnlCC";
	//headerId.cfares=10;
	headerId.cheapoair="ctl00_ctl03_ctl00_pSorting";
	headerId.cheaptickets="bodyWrapper";  //////	updated 1/16/12
	headerId.suncountry=4;
	headerId.booklufthansa="content"; //////	working in some way, complicated
	headerId.flysaa="availability"; //////	working in some way, complicated
	headerId.bookryanair=3;
	//headerId.klm;
	//headerId.flyemirates;
	headerId.cathaypacific=3; //////	working in some way, complicated
	headerId.airberlin=3;
	headerId.wftc2etravel="container";
	headerId.kenyaairways="tipDiv";
	headerId.airfranceus="etapes";
	headerId.aswbeiana=3;
	headerId.wftc1etravel="fare_divNavMenuId";



	headerId.tpeweb02chinaairlines=3;     //China Airlines
	headerId.itn=15;    //Gulf Air
	headerId.virginatlantic=4;     //Virgin Atlantic Airways
	headerId.wftc1etravel=4;     //Varig AND Aerolineas Argentinas.  They use the same portal, and only 4 works for Varig.
	headerId.bookryanair="header";     //Ryanair
	headerId.singaporeair=3;                //Singapore Airlines
	headerId.appshawaiianair="ctl00_ContentPlaceHolder1_pnlTrips";                      //Hawaiian Air
	headerId.c1dspwestjet="meterSelect";        //WestJet
	headerId.c3dspwestjet="meterSelect";        //WestJet (needs 2)
	headerId.midwestairlines=2;                         //Midwest Airlines
	headerId.southwest=3;                                 //Southwest airlines
	headerId.airfranceus="etapes";     //Air France
	headerId.aswbeiana=3;                //All Nippon Airways
	headerId.quicktripbiz=5;     //Macair Airlines
	headerId.bookingairasia="skylightsForm";        //Air Asia Group7
	headerId.travelwwte1=3;                              //Asiana Airlines (quirky moves logo)
	headerId.philippineairlines=1;                       //Philippine Airlines (quirky - moves text in header)
	headerId.garudaindonesia=1;                        //Garuda Indonesia
	
	headerId.itn=5;     //Cyprus Airways      


	//  Not Wrking:
	
	//headerId.bookingelal=4     //El Al no 3 letter airport code
	//headerId.wftc1etravel="sd_ow";     //Aerolineas Argentinas (if the below code doesn't work)
	//headerId.flyemirates=1;    //Emirates significant lack of hooks
	//headerId.airberlin=3;                                         //AirBerlin
	//headerId.iberia="contentPrint";     //Iberia doesn't use 3 letter code
	//headerId.booking1skyeurope="mainTable";   //Sky Europe doesn't use 3 letter codes
	//headerId.wftc2icelandairetravel=1;          //Iceland Air
	//headerId.bookqantas="holdingDiv";          //Qantas
	//headerId.flightbookingsairnewzealand="usAddrPnl";    //Air New Zealand
	//headerId.bookingsvirginblue="left";           //Virgin Blue
	//headerId.bookingsairniugini=4;                 //Air Niugini
	//headerId.catsabresoncweb=1;     //Air Tahiti Nui (not working)
	//headerId.vedaleon=4;     //Norfolk Air (not working)
	//headerId.airpacific="ucLayout_header_topNav_RadMenu1";
	//headerId.airchinawwte1=5;                          //Air China (no hooks)
	//headerId.ceair="right";                                //China Eastern Airlines (not working)
	//headerId.wftc3etravel="sdai_tableMenu2Id";    //Korean Air (no data pass)
	//headerId.wftc3etravel="sdai_tablePIId";          //Thai Airways International (no hooks)
	//headerId.bookonlinemalaysiaairlines=6;          //Malaysia Airlines (not working)
	//headerId.bookonlinesaudiairlines=2;               //Saudi Arabian Airlines (not working)
	//headerId.thy="mainContent";                         //Turkish Airlines (not working)
	//headerId.cathaypacific=6;                             //Cathay Pacific
	//headerId.jetairways=4;                                //Jet Airways (no hooks)
	//headerId.indianairlines=4                             //Indian (not working at all)
	//headerId.vietnamairlines="Table2";               //Vietnam Airlines (no hook)
	//headerId.eserviceevaair=3;                         //EVA Air (not working)
	
	//headerId.="";     //SkyWest Inc. links to Delta, United Airlines, and Midwest
	//headerId.="";     //Aer Lingus doesnt use the three letter naming system
	//headerId.="";     //America West Airlines links to US Airways
	//headerId.="";     //American Eagle links to American Airlines
	//headerId.="";     //Mexicana de Aviación     México  keeps freezing!!!
	//headerId.="";     //AeroMexico     México accepted no hooks, or data pass. maybe lack of 3 letter codes?
	//headerId.="";     //TAM     Brazil doesn't use three letter naming system
	//headerId.="";     //Avianca     Colombia wont let me search for available sites. UGH.
	//headerId.klm="";                              //KLM - France
	//headerId.="";     //Cargolux   lack of three letter code
	//headerId.="";     //UTair Aviation   problem loading page   
	//headerId.catsabresonicweb=3;     //Pakistan International Airlines   no data pass,no hooks
	//headerId.="";     //Dragonair uses cathaypacific for its booking, no data pass or hook
	//headerId.="";     //Air India   lack of three letter code
	//headerId.="";     //Cebu Pacific  lack of three letter code
	//headerId.="";     //Thai-AirAsia   no data pass,no hook
	//headerId.="";     //Air Macau only uses Internet Explorer!! ew!!
	//headerId.="";     //Indonesia AirAsia links to Air Asia.
	//headerId.="";     //SilkAir   lack of three letter code
	//headerId.="";     //Tiger Airways  no data pass, no hook         
	//headerId.="";     //TUI Group    no data pass or hooks
	//headerId.="";     //bmi     lack of three letter code
	//headerId.="";     //Aeroflot  no data pass,no hook
	//headerId.="";     //TAP Portugal    lack of three letter code
	//headerId.="";     //Air One  no data pass no hook
	//headerId.="";     //flybe   lack of three letter code
	//headerId.="";     //Czech Airlines   no data pass no hook
	//headerId.="";     //Norwegian Air Shuttle  no data pass no hook        
	//headerId.="";     //LOT no data pass no hook
	//headerId.="";     //SN Brussels Airlines  
	//headerId.="";     //Pulkovo Aviation Enterprise   no speaka english, seems to use phone ticket selling
	//headerId.="";     //Malev   problem loading page
	//headerId.bookingsterlingticket="";     //Sterling Airlines no hook, data pass
	//headerId.="";     //Wizz Air  no data pass no hook
	//headerId.="";     //Croatia Airlines  no data pass no hook     
	//headerId.="";     //Atlantic Southeast   links to delta
	//headerId.="";     //Air Transat  no data pass no chart
	//headerId.="";     //Independence Air has shut down!
	//  headerId.="";     //Comair links to Delta.
	//  headerId.="";     //Trans World Airlines has shut down!
	//headerId.="";     //Aloha Airlines doesn't use the three letter codes.
	//headerId.="";     //Frontier Airlines   no data pass no chart
	//headerId.="";     //Air Pacific     no data path no hook
	//headerId.="";     //Aeropelican Air Services    no data path no hook
	//headerId.="";     //Alliance Airlines  no data path no hook        
	//headerId.="";     //TACA Airlines     El Salvador    no data pass no hook
	//headerId.="";     //Copa Airlines Panamá    no data pass no chart
	//headerId.="";     //Aviacsa México   lack of three letter code
	//headerId.="";     //Gol     Brazil doesn't seem functional.
	//  headerId.="";     //LAN Airlines     Chile
	//headerId.="";     //Aeropostal   Venezuela   no data pass no chart
	
	
	if(isNaN(site.charAt(1))){
		if(eval('headerId.'+site)){
			headerId = eval('headerId.'+site);
			return(headerId);
		} else {
			return('notair');
		}
	}else {
		return('notair');
	}

}

//////	Begin testing URL

// checks to see if the site is valid 
// an array of all valid sites

function testIsValidURL(href){
	//////	In this section, notes are on current functionality, as far as I can do
	//////	CBL = Check Back Later
	var validSites = new Array
	validSites[0] = "aa.com"; //////	header and co2	with timer 1/19/12
	validSites[1] = "alaskair.com"; //////	neither co2 or header 1/19/12
	validSites[2] = "ata.com"; //////	compiles other sites CBL
	validSites[3] = "ataairlines.com"; //////	compiles other sites CBL
	validSites[4] = "bookaircanada.com"; //////	this site itself seems to not work CBL
	validSites[5] = "continental.com"; //////	co2 (seems incorrect, but displaying) and header 1/19/12
	validSites[6] = "delta.com"; //////	header (needs formatting) and some co2	|	 Updated 1/16/12
	validSites[7] = "expedia.com"; ////// some co2 and header (needs formatting)	|	 Updated 1/16/12
	validSites[8] = "jetblueairways.com"; //////	neither co2 or header
	validSites[9] = "kayak.com"; //////	neither co2 or header
	validSites[10] = "midwestairlines.com"; //////	site may be broken CBL
	validSites[11] = "orbitz.com"; ////// co2 and header (needs formatting)	|	 Updated 1/16/12
	validSites[12] = "priceline.com"; //////	co2 but no header
	validSites[13] = "res.nwa.com"; //////	this is just delta
	validSites[14] = "test.therealcosts.com"; //////	CBL
	validSites[15] = "tickets.airtran.com"; //////	neither co2 or header
	validSites[16] = "travel.travelocity.com"; //////	neither co2 or header
	validSites[17] = "travel.united.com"; ////// co2 and header (check formatting)	|	 Updated 1/16/12
	validSites[18] = "usairways.com"; //////	neither co2 or header
	validSites[19] = "cfares.com"; //////	neither co2 or header
	validSites[20] = "cheapoair.com"; //////	neither co2 or header
	validSites[21] = "cheaptickets.com"; //////	some co2 and header (needs formatting)	|	 Updated 1/16/12
	validSites[22] = "suncountry.com"; //////	neither co2 or header
	validSites[23] = "book.lufthansa.com"; //////	header needs to be moved, some co2 | This site is using a collection of JS utilities called Dojo to make asynchronous calls, will need to look at it more to figure it out see: http://livedocs.dojotoolkit.org/
	validSites[24] = "flysaa.com"; ////// co2 but not header
	validSites[25] = "book.ryanair.com"; //////	neither co2 or header
	validSites[26] = "cathaypacific.com"; ////// header and co2 ***but*** something is wonky
	validSites[27] = "airberlin.com"; //////	neither co2 or header
	validSites[28] = "kenya-airways.com"; //////	neither co2 or header
	validSites[29] = "airfranceus.com"; //////	neither co2 or header
	validSites[30] = "aswbeiana.com"; ////// I don't think this site exists anymore
	validSites[31] = "virginatlantic.com"; //////	neither co2 or header
	validSites[32] = "singaporeair.com"; ////// site is under maintenece when I checked, CBL
	validSites[33] = "apps.haiwaiianair.com"; //////	neither co2 or header
	validSites[34] = "midwestairlines.com"; //////points to frontier airlines
	validSites[35] = "southwestairlines.com"; //////	neither co2 or header
	validSites[36] = "quicktrip.com"; //////	neither co2 or header
	validSites[37] = "booking.airasia.com"; //////	some co2 but no header | no headerid?
	validSites[38] = "onlinebooking.philippineairlines.com"; //////	neither co2 or header
	validSites[39] = "ibb.garuda-indonesia.com"; //////	neither co2 or header
	validSites[40] = "booking.elal.com"; ////// CBL, something funny might be going on with the url
	validSites[41] = "flyemirites.com"; ////// CBL, this site is weird
	validSites[42] = "airberlin.com"; ////// repeat from line 1150
	validSites[43] = "iberia.com"; //////	neither co2 or header
	validSites[44] = "booking1.skyeurope.com"; ////// site seems to not exist anymore
	validSites[45] = "book.qantas.com"; //////	neither co2 or header
	validSites[46] = "flightbookings.airnewzealand.com"; //////	neither co2 or header
	validSites[47] = "book.vaustralia.com"; //////	neither co2 or header
	validSites[48] = "bookings.airniugini.com"; ////// site is offline
	validSites[49] = "airpacific.com"; //////	neither co2 or header
	validSites[50] = "ceair.com"; ////// CBL, chinese
	validSites[51] = "book.malaysiaairlines.com"; //////	neither co2 or header
	validSites[52] = "bookonline.saudiairlines.com"; //////	neither co2 or header
	validSites[53] = "vedaleon.com"; ////// CBL, this site is weird
	validSites[54] = "thy.com"; //////	neither co2 or header
	validSites[55] = "secure.jetairways.com"; //////	neither co2 or header
	validSites[56] = "indianairlines.com"; ////// site no longer online
	validSites[57] = "vietnamairlines.com"; ////// CBL, something funny might be going on with the url
	validSites[58] = "booking.sterlingticket.com"; ////// site no longer online
	validSites[59] = "klm.com"; //////	neither co2 or header
	validSites[60] = "flyemirates.com"; //////	neither co2 or header
	validSites[61] = "wftc2.etravel.com"; //////	CBL, something funny might be going on with the url
	validSites[62] = "wftc1.etravel.com"; //////	CBL, something funny might be going on with the url
	validSites[63] = "tpeweb02.chinaairlines.com"; ////// site no longer online
	validSites[64] = "bookings.gulfair.com"; //////	neither co2 or header
	validSites[65] = "bookings.westjet.com"; //////	neither co2 or header
	validSites[66] = "c3dsp.westjet.com"; //////	CBL, something funny might be going on with the url
	validSites[67] = "travel.wwtel.com"; ////// compiles other sites CBL
	validSites[68] = "wftc2.iceladairetravel.com"; ////// CBL check icelandair.is

// these are the car sites
	validSites[69] = "map.therealcosts.com";
//	validSites[70] = "mapquest.com"; // not working right -- new js
	validSites[71] = "randmcnally.com";
// ending car sites


	

	for (var v = 0; v < validSites.length; v++) {
		if (validSites[v] == href){
			return true;
		}
	
	}
	return false
}

////// 	End testing URL

// retreives the correct Id to insert before from an Array, keyed by URL
function getHeaderIdCar(href){	
	
	site = stripHref(href);
	
	
    var headerId = new Object;

	// this is the array that contains the Element Id of the Element before which
	// we will put in the Header.  for each site, add an Id
	// mapquest, randmcnally, yahoo, http://mappoint.msn.com/(eurmjln5andgkwvo42mygf55)/Home.aspx, google.com/local, any other mapping websites
	        headerId.maptherealcosts="mqaddress-start";      
	        headerId.mapquest="mqaddress-start";      
	        //headerId.mapsyahoo="javascript;   
	        headerId.randmcnally=1;       
	        //headerId.mapsgoogle=1;
		if(isNaN(site.charAt(1))){
			if(eval('headerId.'+site)){
				headerId = eval('headerId.'+site);
		    	return(headerId);
			} else {
				return('notcar');
			}
		}else {
				return('notcar');
		}
		

}

//////	End Functions for URLs

////// Begin test to see if the code is in fact in the array for air

function doAir(originFound, code, span, href){
	 
			
			
     		if(destinCounter == 0){
				destin0 = code;
				destin1 = 'one';
				destin2 = 'two';
				destin3 = 'three';
			} else if (destinCounter == 1){
				destin1 = code;
			} else if (destinCounter == 2){
				destin2 = code;
			} else if (destinCounter == 3){
				destin3 = code;
			} 
		
			
			if (originFound == false){
       			var origin = code;
				GM_setValue("origin", origin);
				if('start' == GM_getValue("gmOrigin")){
					GM_setValue("gmOrigin", origin);
				}
      			originFound = true; 
     		} else if (originFound == true) {
      			var destin = code;
				//onlyOneDestin = destin;
      			originFound = false;
				
				GM_setValue("gmDestin", code);
				
				origin = GM_getValue("origin");
				
			
				if (href == "jetblueairways.com"){
					
	            	var parenSpan = document.createElement("span");
    	        	parenSpan.appendChild(document.createTextNode(') '));
    	        	span.appendChild(parenSpan);
    	        	
    	        	//set justFound flag -- track of whether just added a carbon
    	        	justCarbon = 1;
					GM_setValue("justCarbon", justCarbon);
            	}


				units = GM_getValue('units');
				if (units == "usa"){
					massFactor = 1;
					massUnits = "lbs";

				} else if ("metric" == units){
					massFactor = 2.20;
					massUnits = "kg";
				}


				var mi = CalcDistance(origin, destin);
				var carbon = (parseInt(((mi * 1.36)/massFactor) * 100))/100 // 1.36 lbs carbon / mi / passenger
            	var carbonSpan = document.createElement("span");
            	carbonSpan.setAttribute("class", "realcosts");
            	carbonSpan.appendChild(document.createTextNode(' ' + carbon +' '+ massUnits +' CO2'));
            	span.appendChild(carbonSpan);
      		}
			destinCounter++;

/*
*/
	return(originFound);

}

////// End code test

//////	Begin add css to page

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

////// 	End add css
//////	Begin add script to the head of the document
function addScript(scriptText){
		var head = document.getElementsByTagName('head')[0];
		if (!head) { return; }
		var addScript = document.createElement("script");
		addScript.innerHTML = scriptText;
		head.appendChild(addScript);
}

//////	End add script
//////	Begin, I think, code to pop up new info either with a new version release or the first time the script is run
//////	????????????????????????

function firstRun(version){

//	for resetting this script for debugging
//	GM_setValue('firstRun', 0);

//	if (version != GM_getValue('firstRun'))){
	if (!GM_getValue('firstRun') || version != GM_getValue('firstRun')){ 
		addGlobalStyle('div#firstRun a { color: #ccf;}');
		var box = document.createElement("div");
	  	//box.setAttribute("title","Click box to expand/collapse");
		box.setAttribute("id","firstRun");
		box.setAttribute("style","position:fixed;z-index:99;top:15px;left:15px;background-color:#FF8B19;padding:4px;text-align:left;opacity:.85;font:12pt sans-serif;color:#fff;overflow:hidden;width:400px;height:auto;margin:15px;padding-bottom:15px;padding-right:15px;padding-left:15px;-moz-border-radius-bottomleft:20px;-moz-border-radius-bottomright:20px;-moz-border-radius-topleft:20px;-moz-border-radius-topright:20px;");
		box.innerHTML = '<h2>Welcome to the Real Costs v 0.0.7.2</h2><p><strong>Bug Fixes:</strong></p><ul>  <li>Fixes bugs associated with URLs beginning with numbers</li></ul><strong>Coming Soon:</strong></p><ul>  <li>Integration with <a href="http://www.google.com/local">Yahoo Maps</a>, and <a href="http://www.google.com/local">Google Local</a></li>  <li>Integration with <a href="http://hopstop.com/">HopStop</a> and <a href="http://www.google.com/transit">Google Transit</a></li></ul><p style="text-align:right;">this will only appear once</p><div style="text-align:right;text-decoration:underline;" id="closeFirstRun">click here to close box</div>';
	  	document.getElementsByTagName("body")[0].appendChild(box);
	  	
		var listenCloseFirstRun = document.getElementById('closeFirstRun');
		listenCloseFirstRun.addEventListener("click", closeFirstRun, true);


	// un-commment this out for release!!!!!!!
		GM_setValue('firstRun', version);
	}
			
}
function closeFirstRun(){ 
	document.getElementById('firstRun').style.display = 'none';
}

//////	End first run 


function getUnits(){

	//GM_setValue('units', 'usa'); // for debuggin xpi probs


		var reset = window.location.host;
		var reset = reset.replace ("www.", "");
		var reset = reset.replace (" ", "");
		var reset = reset.replace ("/", "");
		var resetPage = 'reset.therealcosts.com';

		if (!(units = GM_getValue('units')) || reset == resetPage){
			respConfirm ();
		}

	}

function readCookie(strName)
{
	var nameEQ = strName + '=';
	var arCookies = document.cookie.split(';');
	for(var iCounter=0; iCounter<arCookies.length; iCounter++)
	{
		var strCookie = arCookies[iCounter];
		while (strCookie.charAt(0)==' '){
			strCookie = strCookie.substring(1, strCookie.length);
			}
		if (strCookie.indexOf(nameEQ) == 0){
			return strCookie.substring(nameEQ.length, strCookie.length);
			}
	}
	return null;
}


function respConfirm () {
     var response = confirm('Do you want to see Metric or American units? \n \nThe default setting is to Miles and Lbs. \n \nIf you want to see Kilometers and Kilograms click "Cancel" \n\n Click "OK" or hit Return for Miles and Lbs.\n \n After clicking, please refresh! \n\n To reset this preference, click "Reset Preferences" from The Real Costs homepage');
     if (response) GM_setValue('units', 'usa');
     else GM_setValue('units', 'metric');
}





// new distance calculator

function CalcDistance(orig, dest){


	var Orig=new Array();
	var Dest=new Array();
	
	from_airport = getAirportLoc(orig);
	dest_airport = getAirportLoc(dest);

			
	if (from_airport != "" && dest_airport != ""){

		Orig=from_airport.split(":");
		Dest=dest_airport.split(":");
		mi = newdistance(Orig[0],Orig[1],Dest[0],Dest[1]);
	}
	
	return(parseInt(mi));


}

// Definitions:                                                           
//   South latitudes are negative, east longitudes are positive           
// Passed to function:                                                    
//   lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  
//   lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  
// this function is adapted from code found at 
// http://www.zipcodeworld.com/samples/distance.js.html

function newdistance(lat1, lon1, lat2, lon2){


	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	return dist;
}         
                            
// end new distance calculator

//////	Begin oil calcs




/////////////////////////////////////////////////////////////////////////

// 	BIG ARRAY OF NATIONAL CARBON FOOTPRINTS BELOW

/////////////////////////////////////////////////////////////////////////

//nations[1]="world#5.6#data:image/gif;base64,R0lGODlhGgAaAOYAAFV+eFt5bVd2dnVgO1N9fG5OT4gfIWZbXIQmKH0zNd7Vyq6WemduV45sRXhdNng4Punv756BYG9lRnJjQXtaMHRFQ7ahh3M8R1h7cqaMbXBFS9Pg4Obf18a1omxoTF52Z/b08b6rlYZiOMjY2GRwXNbKvHVBQquZgO7q5GFzYoaqqd7n587Ar6fBwX6gnL3Q0J2UfYKKeaichc7Tzaiuo8O4p9PNwpZ3UrixoG6Lgr2+stna1YBnQ31qSMjFumaAdPT393uiopGysYSHc12IhWWTkmlrUVKBfVCEg35YK////4wZGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAaABoAAAf/gEuCg4SFhoeICAkPDwkIiJAGBQJIlUdHSAIFBpCEFQRHAEgAmEYkH0gEJp1LB5WiSAwUKRJJSQyiB5AHRwGVSB5GGLK2SQOXuoYVSAMpv6FIGBPFSQ6iGoUGBEZJvr+V3NS3qZyDBQBJFN+VH+K2E5UFhALcPRsvSEEjSLUhFkkZSiioQSTTIARIHCRZsEJJkR9KhiQRASLDAhALInBYUenRkgRHbCmgMaPFBBY+jJxAkQTFAlsiGng4kkDQhQBJGihpsADCBxcgjNgIkURJhCQdFCjo9sAmTgtKFHBQEiMAhAVKcgCAcCLJDahMBYFMwqFDhAgKOiTBAWFDJSFAg2TAKKEkCU1BCHkoaGArA4sBDXao+KVixAYdDRwg8biEnrtaDNZVUmhEAKFz7mxRwLTOFgB5g7SFczfAWyUSSYwQKDdIA7PMtn5xG4BklSFeAzLDi2XsSLJDrkYXkxAtNZLfiD4BMKLQlodXBLCxWiKJUq8AmDSxno43wYVGjLmLNxQIADs=";
//nations[2]="goal#4.7#data:image/gif;base64,R0lGODlhJgAYALMAAMKZqaFwgM91db9RUI4DA/fPzv///5SUtfCfngAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAmABgAAAR/kMhJq714hs2750IojqQoHWiqrinivnD8nmytynhM23bh/8Dgb8djGY7IpBJJLKqWUGXTiRJag1NqbovIOrk5b/FKLoh50bThbFNHJYC4fE6Xl68SsH6f3/vDBHeCgxJuhoeFh4pvgYOOeAR/kjqRk5YSA5mam5ydnp8ZoaIZEQA7"


// function to return value for airport

function getRandomNation(){

var nations=new Array();
nations[0]="China#3.5#data:image/gif;base64,R0lGODlhJAAVANUAAO6QjPzygPXDhvCfiu+Yi+6PjPjXg/vwgPKuiPOxiPvsgfXEhfvtgPnegvS6h/jWg/W/hvnggvCbivCgivrngfGmifjbg/S5h/rpgffUhPfRhO+Zi/rjgvfPhPvvgPCeivKoifOziPrkgvnhgu+Wi++Vi+6OjPzzgO6NjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaBQJRwSCwaj8ikcskUAj7Ek7RJTVyiUyrzocGetEtSAAMuO6SSpPRbFkakIXW2ifCs71JRhuAFVxR4awYlbUcDFHgBEIVJCHgdjEkCeAwAR2ttFicHAhxSCZdzVAAHIwMoAAIBBqFsWiALBUQTDRuRRbJGJnwomLdKvr9IwcLFxktBADs=";
nations[1]="India#1.1#data:image/gif;base64,R0lGODlhJAAVALMAAICAp8/P3qOjv4WFqvDw9Li4zoODqf///5jJgfO5gAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAARVMMlJq7046827/2AojmRZHmiqroEwCMEqz7QaGEBuxHVfC4ACoQAQ+I6yAYBwIAAGyCgKKCQapchbDrDDRlsvXhRBLpvP6LR6zW673/C4fE6v2+/3CAA7";
nations[2]="UnitedStates#19.9#data:image/gif;base64,R0lGODlhJAAVAJEAAICAp////+6NjAAAACH5BAAAAAAALAAAAAAkABUAAAJAhI95wu3flEywvomB3SLPAIbiGHoSiY6mkrbBSnEVjMgzbdgQbrgpD/ChgEKS7ohMKpfIovMJjUqfzKr1im0UAAA7";
nations[3]="Indonesia#1.6#data:image/gif;base64,R0lGODlhJAAVAIAAAP///+eIkyH5BAAAAAAALAAAAAAkABUAAAImjI+py+0Po5y02ouz3rz7bwHiSJbmiabqyrbuC8fyTNf2jed6WgAAOw==";
nations[4]="Brazil#1.8#data:image/gif;base64,R0lGODlhJAAVAOYAAP/igP/jgP/kgP/mgP/lgIDIoYDJoPPggu7Wh5aNuZSLt9PZip3OmInKnefdhqfQlpzOmKnRlZbNmvzjgP3igJCIuczYjMrXjd7ciMHWj7PTk/zkgLnUkZGJuovLne7fhOTNjKzRlfnigYHJn9zbiIXJnt3HkePNjefdhYLJn5aMtrHSk/7igNPaiobKnpTNmv7jgO3ehI/LnOjehaLPl/7kgPHYhsPWj7vUkeDch5DLnKqdq4yDuIuEvPvggKihwpOKuI+EtJKJt5CHt+bPjJmQu5KItpKKvPzhgf7hgLepppOIt5aNu5WMuaaarZiQutC9msGwn5iOvN7Rpaqeq9jEl9XBlYqBuMCwn6ebrpSLuNfCkJWMtZKJtpOJt46DtY+FtJCGtZCHuffgj4yFu72rnefVnI+EtZWLufXcg7anpfbchJKIt42FuuXOi5aOufzhgIDHoYDIoJOKt////4DJnwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gHWCg4SFhoeIiYqLjIpyj3KNkoNycS8LJBBxkZOOcTIXEwMDAi0Sm52GlQ0ZGwQ2ICcIAgMWOqipBnElHAcDJlQqFRUKTlYEIjceuI1xIysxAkllVzxz13NiZGpIAgc4LnEGiwVyESgBAART2NcJbF5CPVEELAEfGilxiHIFNDnp4FBYQ6egwYJzEnzhgqAGHAABZoToV0gOAwwAAMDZSMANEzRBloAJk2AOwiNbBmx8GMDBA06CLGLUyJHIkCZarr0pYuTMk4JmYKyE6BJmTH8ANcJI065pFyk/xlBgKZHioXLn0g2A0rRrDXv49DFyBi2AACxt5gBR0E6JD2/gNcRJ0sXLl4kdKjp0UJClioBky4xKWtXqVaxZBGwxSxXzU6hRpU4JZkzJEiZNkylXhKS586JAADs=";
nations[5]="Pakistan#0.8#data:image/gif;base64,R0lGODlhJAAVAOYAAICvgICwgICugIK0gqnMqYGzgYS0hJS+lN3r3c3hzZO9k6PHo5/Fn4Ozg9no2YCtgNbn1pa+loi4iOTv5KXIpYa2hrPQs4GxgZnCmZrBmq/Or4W2hZrDmuHt4eLu4vv8+/b69qXJpfD28PH38bPRs6THpObw5oGygd/s35K9ktjo2Nzq3PL38pjBmLDQsODt4Im4ifX59cfdx8LbwvP489vp26LIopC8kMbcxsLawoO0g8TbxJ7Entfn14CygICxgP///4CzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfxgECCg4NBhoeIiYqKhI1BP4uRkkGNhI+TmIiVhZCKPp2ZhpuCl4kBBRgVPoerkqNApYcAKT0LF4cDAwCgia+xQQEKMTkPrD8zFCEni76gPg0mHxKdPjoaIEAEAMyjsQAEQB0/rT4DESoQJAatmt2gAAlAKOOIABwDPwXcm94OQCwbeD1ix8idrHhAXBQLJcqgoW+CaBwQQPBRvoL8nDWYIGhECQACAgQACcPGul4ODQUTMaiGBR4tFuxAkCEAxkq/ggC44a/SiwPbbjoSCOwHAxwrPCCQweCHzX04iQbxESAkVauuUkaqGKkZQ0y+vmIKBAA7";
nations[6]="Bangladesh#0.3#data:image/gif;base64,R0lGODlhJAAVAMQAAIC3p/yUoP6UoLGopKCspbanpOSboYS0p7ylpLqlpPmVoJivpcyho4O0p8Gko+uZof+SoJWvpoG1p52tpd6cotudorCopKGspf2UoMCko+ObosOjo/+ToIC2p/qVoIC1pyH5BAAAAAAALAAAAAAkABUAAAWJ4CeOZGmeaKquLNoBcNfOYncQBTIsn0yrncGDQ+QEKBPfzyRhcASeaNRoUS5rGYh06wlgLtZfJ6IIcLccQ+MqAjg4Z66AEJ51KvC4lJMAsD8aUHpTG35Xd3mDfIZLbol6c3UtY2WKan89WXpeYJgfTU9cVJJLQUNFR0meJDY4OjykmC8xq7W2SyEAOw==";
nations[7]="Nigeria#0.7#data:image/gif;base64,R0lGODlhJAAVAJEAAIHEqYDDp////4DDqCH5BAAAAAAALAAAAAAkABUAAAJGnI8my70JI3RUyJsCqA77oXHNh4XiQ0rmmarbabXQKsrzy9oIzek7XvMZeBXhENgzEilGELKofDKjsJhw2aHCmoott/opAAA7";
nations[8]="Russia#10.9#data:image/gif;base64,R0lGODlhJAAVAKIAAI2A8oiI//mAhoCA//+AgP///wAAAAAAACH5BAAAAAAALAAAAAAkABUAAAM+WLrc/jDKSau9OOvNew9gKI5kSQ5oqq5s675wLM90bd94DOS24P/AoHAoJBiPyKRyyWw6n9CodEqtWq9YZgIAOw==";
nations[9]="Japan#9.9#data:image/gif;base64,R0lGODlhJAAVANUAAOaFkeeIlOeJleaDj+uapOeGkueJlOeIk+aEkP/8/OaCjv/9/eWBjf/+/uaCj/LAxvCzuvXO0/PBx/bQ1P3z9PPEyu2krfni5fK/xueKlvne4eiMmPzu7/vr7fja3eiMl/vt7+eHk/je4f77/Prk5vPCyOucpfG5wOaGkeueqPvo6vfV2eygqe2jrP/9/vTKz+6qsvvp6+iPmvzv8eaBjv/8/fCyuu2mruaFkPjc4Pnf4uiLl+eKlf///wAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaUwJ5wSCwaj8ikcslsOp/FRAL6BJVuBILl0aEqKx8FoFAAKDKYhdd4Yhx48HiAAWmsh6uBIc7nCWgRdz0LLAB9fQAEI3czGwGHfAYCMXcqPHuQcAIHF3cUMo+ZPAE7HIIwA6I8CC12dyQBIZkHKBqCQhMFCAKIAC+3QyIpAA4DAw44Jh7ARC46EhA2Dzk1zNbX2NnZQQA7";
nations[10]="Mexico#3.9#data:image/gif;base64,R0lGODlhJAAVAOYAAP7+/f319vX17evq2v/3+fv17P72+OXn3KmWhubl2vTu6O/y5/Lu6+/w5Pn8/a6VgP7//rigiOzp17nJu/r48NnKrO7v7bLMv9fh0+vn4tDSwePew6esor+tn9rMw6zf6LWjkri4nvv5+ObPs6eYi6ORg7bKxrvg4rmmlerp2q3T1ebl1OTl1P39/Pj7/KzIw/j79ebZzNTfztng0fDm2qaUh+LSuq6bi97Msv7++7Smmvf7+v39++HTxrykjeTQq+vl3vDu37Kbhfz8+vX17NnOs93m2sWqivf6+qGPgPLx4/f6+f309eiSneaHk////+aKlYCypAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfTgFGCg4SCS0+IiYpMUI2Oj42FklGHipZMTU6QkJOFlZaJmJqbjp2En6BPoqSlpoapoZmska6UsIirs7W2iAA0PQqxo6y7lUo4Rw8kQLiyurWHOUEVEQhJKCKqzsS1Oy0FG0VCNyAlGQAB26S7Dg0xGj8+NR06CQsE6pu7LhQzKiYvQnDwsAKGgXycaiEBIMHIhwkXThxIASHdsHXQnvBgIWOEDQwDhmi7qC8jIiIWGAgQNgtKsVsjW768lYubK1SgamK8CVNnSZ40ET6aCYtRSyiBAAA7";
nations[11]="Philippines#0.9#data:image/gif;base64,R0lGODlhJAAVAOYAAICX0uaGkf///f/87eWBjP//+f///P7vrOaEj//76f/31v/65OaDjv///v/1y8DN6f/1yf/97P/++f/4x4CY0vPFyv/++P788Pvs8ICW0f/43OPp9v7zwP/1zYCV0YCb1O3x+f/zwaK13//0x+eHkv7oh+qao/7wsPCzuueIkumVn52x3v7ng+yjq/76+/7qktLc8Ieg1YCZ0/7nhuaFj/H0+/7qkYCb0+WBja2+4+eLlv/87v7to//20f7zwbPD5f/64/nh5PfX2eaCjfj6/f7vrv/31/7upv7up+6utvzv8f7qlPv44/7h4v/42JOp2oCa0/7nhP7xt+iOmPbR1fK/xd7m+P/76P7394Gb0/7rmv///+eIk4Cc1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfegFuCg4SFhoeIXYqLjI2Oj5AFTJCUlY8LWgU1P1kAH5agjQ1aDYIbIgAUoauHME8eUKuWhANGgkQPMRk3spCCGgpOUjsOBlsgOTIAvY6CCUU8WgcjhFYrzI1bAx0HLDMvEFpaWxITF9iMW1chSFElNhzjWxbiTVz3+Pn6+4IDJ1pLjvQghCEJgn0IEwoSp0DLAh8CtmCpogNHioQY8xFKIG8LFRUEAmQcee9QkBZDaJBcaUBLxC1KUARgsLImEHEuKkwhQKJmTQERhJgI6bMoFwYHjdZExLSp06dQmQYCADs=";
nations[12]="Vietnam#0.9#data:image/gif;base64,R0lGODlhJAAVAOYAAOaDk/7oi+aHk+eHk//tiv7qi+aEk+aGk+aFk/bIjf7pi+WDk/7ri+eJk//uiuiNkuWAlOyfkfnWjOiPkvbJjeubkeWCk+2kkPO9jv/viv/yivzhi+eKk//xiu+skPzfjO6okPrZjPO8j+mTkumSkvXDjvXFjvK4j/XGje2jkP/zivrajPvcjO6lkPCukP7ni/fNjffOjfzgi/zji/S+juiMk/K2j+ygkfbHjf3ki//wivvbjPCwj+eLk+WBk/O8ju2hkeiMkvbGjuSAlOeIkwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAe/gESCg4SFhoeIiYqLjIwCjZCHPRMDkZZEBhciC5eRCyUyHJWdiwIPHw4pAKSGDQcAsEMgBA4oELAACKwCEz8xFAlCOwUKOcAJMDgVB6QCIyYZGg4MAQEKBDoqEhGjpAcLERIF1dUKGzwHBqyEC0Es1NYFQBDd65gVLwUEBAwENhb2CFmgoaEABhcbOoRo8CigqRkrbgDwQSJBhgurAiJogYFDRgQGPJxgFpDIAwQNBxmo0aAkkXqEYLqcSbOmokAAOw==";
nations[13]="Germany#10.5#data:image/gif;base64,R0lGODlhJAAVAKIAAPCAgOiAgO+GgIaAgO6AgICAgP/ngAAAACH5BAAAAAAALAAAAAAkABUAAANAWLrc/jDKSau9OOvN4fhgKI7kSJxoqq4sG7Rw3AJybd94ru+8LPzAoHBIHBqOyKRyyWw6n9CodEqtWq/YrFabAAA7";
nations[14]="Ethiopia#0.1#data:image/gif;base64,R0lGODlhJAAVAOYAAIC0nPjtjv7virnfwI3V44HS77jfwZDW4YDV9dvloInU5vWckOPjn4DT7fTskvacj//via6+yoDU89mpprffwa/dyvCdlILBvfKjk4PS76fbzveij4DHz8WztprZ2YC7r47W4/ebj4C0m4jU55/E1oLR8pHW4PSdkYDK2rHdxqHa0/Gek6rczIC0nYHT8Lrfv6vcy5LW36La0rbewrXew5DX5IjY56/dyJjY2oDQ9ZzZ14PS8YfU54HR8K7eybXexIPR84jU5qHZ1IDR8oLT8I/V46/dx63eyZrY2fGjk/GdlPzui/GelIC1nwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfWgE2Cg4SFhoeIiYqLjI2Oj5CRhwAiLSIAkowAHxwoHB+YmYkXDRI1Eg0Xjkusra6uCRkgIwNBIBkJr7q7vEsVOwoaMxoKJRW9yLoCAQQqAy8pAwYyBAECydgQDiMFLDRDFDc9PA4Q2MnLB0VIBj8UMEIm1ufYRzk6BkYDOEA+9OcMiHg4QCCGBxcMzjFhkqShw4dJMGzoUACBDQQFOmzAALFjkoVKQoocqcSCkgcTIpCIMOFBSZIwlSycSbPmwgUhToRYYLOnz58zVwAdSrSo0aNIkyYNBAA7";
nations[15]="Egypt#1.9#data:image/gif;base64,R0lGODlhJAAVAMQAAP7rm////v//8f/77P/62P/76P/97P/87v//9v/87/7up///9/7tpf7snf7tpP7sm//97f/76f/4y//3y/7uqP7snueIk+aGkP///4CAgAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAVm4CWOZGmeaKqupuW+cCzPskjf+GznPM7+wKCQhCkaj8giIMlsOosBwwKAgASe2OaBAehSEtnwcQBwABSNgXgdeXQBlcJaLJgQAASJYL5+8zOAgYKDhIWGh4iJiouMjY6PkJGSk5MhADs=";
nations[16]="Turkey#3.1#data:image/gif;base64,R0lGODlhJAAVANUAAPGEivCAhfGCiPGAh/GDivGBh/azt/KNk/GFjPCAhPGDifKLkv729vGHjvzk5fezt/OUmve3u/zh4vGCifGHjf/9/fOXnfvc3ve0uPe6vvGAhfzj5PSfpPi+wfCAgfi/wvvd3/KJj/rU1vaxtfzm5/rT1fKKkPnHyvrR0/vb3P3q6/rU1/SZnvSdo//8/PvZ3PSeo/3p6/GEi/////GFiwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAayQJpwSCwaj8ikcslsOp0y2XMqGwQGhYCGMFUiJgPOSeIQGQ6CLlIQQs1mpM8okrFwpWohAHCZVR4DCQEBABAmNAoEMgBqAQZvHR6MQjIECDIYFAILeFAFIDMMaEYyDRspJS1pTwAyMTMqNJNDCiwrLjMvCV0yn6GjRaWnJTCrT46QkkOVl5mbnU57fX+Bg4WHiYt5bG5wcnR2NNBqX2FjZWfGecFWWFpc60pR8fT19vdTQQA7";
nations[17]="Iran#5.6#data:image/gif;base64,R0lGODlhJAAVAIAAAP///+eIkyH5BAAAAAAALAAAAAAkABUAAAImjI+py+0Po5y02ouz3rz7bwHiSJbmiabqyrbuC8fyTNf2jed6WgAAOw==";
nations[18]="France#6.6#data:image/gif;base64,R0lGODlhJAAVAKIAAPeTlIOLxfien/eVloaOxv///wAAAAAAACH5BAAAAAAALAAAAAAkABUAAANgSLqs9TC+QaulrQUiexHAdWXM5kmgaJGLeUKpirGE+36hPNA1d+O6Hc32isl4xJNRhfTdlqLmD6iT/qCjobOYO2qn2NX32mWOn+XomRu0ottrZTrLSnrCFTe7ytueghQJADs=";
nations[19]="Thailand#3.4#data:image/gif;base64,R0lGODlhJAAVAKIAAOWBjPX3+P///4CTpOeIkwAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAANBSLrc/jDK+YC9OOutqadCKI5kaZ5oqpZB675wLM9Dbd94ru987//AoHBILBqPSORsyVyuntCoNPSpWq/YrHbLSAAAOw==";
nations[20]="Congo#0.9#data:image/gif;base64,R0lGODlhJAAVAPcAAOeHkOaEkIDR8YDR8OaGkOWCkeWBkeaCkOaDkOaFkIDQ8e2Xjc3nsfe0iOmKj/WuieqOjoTT7eaDkdvopfrTifrBh++cjJ/b1+LooOeFkOjnm/vOiMXmuPrIh+aCka7gy/i7iOuSjoDQ8vnYivOnivGhi/Hjk+3mlrXixZjZ3YDQ9bbixfbNi//sh4HS7+vomKXZ0PXgj4zV5uzml4fU6vnBiY3V5pPX4abd0abe0dToq73kvvjdjYHR75LX4b7kvtXoq8Deu4jU6fvri4DP9YDP94jS6uiHkP/siJnZ3NHireiIkOzomPThj5bW3Z7X2fvIiP/theyej4PR7sbgtvOoivHkk9fjqaXZ0YPS7PPpkZDU44XS6v/shczhscHfurDbyJ/X1/Tgj/7ribXcxL7kv+6bjffcjfvHiP/shojU6vvrjILS7IHR7vGii57Y1ozU5abZz+6cjfrrjNjkqNPirZDV4Z/Y1ZTV4O3ml73kv/fdjYbT6YDP9oDQ84DQ9IDR7+eIkIDR7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AAUJHEiwoMGDBFG8YBGIoIA4fAAhnChQwR8ZP/J0kCOh4QA/f9oweVPEjwCKBUX88cHBSoUFBwIAaAgHRhgyXZQ8geFEIkVAfvykYNAERIgCAQIFStDQSJA5SNaMaXEFz4CJQAVcALKnAQQDTAMFOLCghqABfe4MSRPliwoFCAH96YFjwogHDgwQCAQAAQILHWaUEfgHTIs6Wuj4OTjgT4QPGCiQWFJgLwAPGUps0IBCiEBAU6hgIbLFi52TAwWooLFCw4YSGTzMJFAAAAkKGD5E+EOQTZbFCgBx8WnRxo4TUCwgkDDbgIMHIybkcPHnakGfggBJVHmDg4mXMWcmtzAAoQEPHRcE+MGONejQGEaRKg1QIASIGAxSBGUf1+QFHTx4BRZfYy1QgQkc3PCHCCgJ1JgLOdiFl158SfAXGifsYMMfcDXY2GORVQFAZXxhppkGK9CgAmoNCqIGCq65EdtsBRxxW267WdeiIHrM0IFyCDT3XHQ49PAHfy3WAFNSS5HXwBlApLfejgYtNV99IIjBQBL7UXkQgWQdyIEPC3o5USASmNHBCT/IwKGZFEnBwgsrwLljQAA7";
nations[21]="UnitedKingdom#9.3#data:image/gif;base64,R0lGODlhJAAVAPcAANLS4Pv7/O6Pj4+PspGRs/Pz94eHrLq6z7y80f709Nzc58DA1PCZmNXV4u+Tk4ODqcPD1YWFqpaWtt3d6J6evPDw9fvg4MXF1/Szs7290YyMr5eXt4GBp+jo79nZ5dvb5vbAwL+/04qKrvX1+PnX1/76+u+VlO6NjfCamd/f6fKqqoaGq6Ojv9jY5NDQ3/TJyqCgvaGhvvnY2K6ux/39/v/9/Z2du/GsrISEqvvh4fCbm62txuri6O6Oje+bm7i4zvCZmbKyyampxMTE1u/v9MDA046OsZCQssbG2Orq8fCYmOfk6/Hu8uPj7PHx9vGmpoKCqPOurfre3qqqxIiIrO+Xl+Xl7fbp6/vm5sHB1Le3zYGBqM7O3fbf4Pra2vfKyqmpw5mZuPzo6PW6uq+vx+3b3/TV1/z8/fChoe+Wlt7e6PLAwaenwvOxsefn7vGgn/jR0Z+fvZSUtezU2JWVtcLC1fPq7v75+JKStPbCwvCcnPS4uImJrfzs7Ozs8vzx8vGztPKsq++Sku6Ojvz3+JiYt/S3tvbu8K+vyPW7u9TU4fOwr/GlpPCenf/+/vCfnqiow+bm7vrf37a2zf///4CAp+6NjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AIEkoARAQ6WDCBFSomSpYcOFCSOyWFDGQYBGbSjROBBRIUOHliB2DBNiCRpGNUS4kGRJBqUOMDouBBmSUsQBIZoAMtGnQIODMTrsYVCCkgsRCWeCFFnJAIIPL06QCNBgipyEBwgpGUMpgBaPNCFyQNSiiwAQlFpMIvCgowYAJE7koGSFQiWlDhdS8HBIhwpKKTIMMNAxIYskix4t5IL3ISUiURgkqFDkCJ/ChRH8cZBn4ce8lARYCJDFxorCnlOrTh12tevPNGPLnk27tu3buHPXfv26Ne/UhalsyFBAjKBEjWtSGkEGc2EDBBC4KfHmiRMFyRdWuUNJzQbnB3EMiDjggRKGNFcUsImQnRITFIYWXoCCGU8QRWe+9DDz4cfpu7DVtMUQXlgiBSUF7BARAWAAMIIFAqwxwQJGJBWgSBJMgIEejlCiAB0IAeBHAijcEEkdEsh0oU0IzWCHCWhRAgEHdwXiAw8QxIFZexE9gAQcg2BBSQVCCDDHBZBE4ByPHRWSwl8LBQQAOw==";
nations[22]="Italy#8.1#data:image/gif;base64,R0lGODlhJAAVAJEAAOmRlv///4DGowAAACH5BAAAAAAALAAAAAAkABUAAAJJlI8Wy70Ao4SpCofD3MCm7HCTh4CNKJGHyaCRqrCa28Hy7MKXTNfq3dMBaUIe0WbMIVnBpan5S6KKzGO0qrw+raRhtisVUbeuAgA7";
nations[23]="Myanmar#0.2#data:image/gif;base64,R0lGODlhJAAVAOYAAPGWivKWioqh1I+g0Iyh042fz/f4/Ort9qm226e02rvG47TA4KWy2b7I5IudzrjC4aWz2cXO5peq2KSy2eLm8+Dl8pen05Ch0dzh8ZOj0ufq9bO/4Ki53/P1+pCk1Ku43L/J5Jaq14yez9nf76Ox2aq325Gl1Yuh04ug06y43Jmp1O6WjKCv1++WjMzU6u3w+MTM5qCu17K935Sl0rC83uyWjoai19Xc7rS/3+jr9Z+u17G93rK+3rnD4qy53MvT6dLZ7I+h0LbB4Oru9pio1LO+3/j5/N7j8bK93rfC4Y6fz6663ZCh0O2WjgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAe7gEyCg4SFTAFNiYqLjIuEIgw7CxMKTAOCAoeNm42DDjglMhFJCAoZl5mInKtNggNEKTQHBgYuHzGomqycggU6SD9HFUMHD0UFTKm7vEwFLAtAGBo5Lz08AwPKy52WFhANBh1GFAwJuarbjoIOQj4wIzcJICpKybrpioQFCBtLJA0zLgSxhw5fKyYECKDwYIKDhBAnEhKwcc+goYuDVhhcBKCjx48eA7SosbGkyZMoU6pcybKly5cwY6YLBAA7";
nations[24]="SouthAfrica#8.3#data:image/gif;base64,R0lGODlhJAAVAPcAAIC9rYC8roC6p4C7qYC8qoC9roC6qIK+rJbCp4CHwv/fiKPPwvCbkIC7qPCZjvCYjZfJuoS+rJPBqOHUkfvejYWNxfa9toG9q/v4/tPRlfj++ej59vCckYnBsej39OLWkozDs/Gek57EpIW/rsXI5JvLvNrb7t7Vk+jYkdrUlbHJn/r/+u3s97iphNXq47u/38rQmde+hvKlm7OlhKGXgvGhlvH69ZrDps23hf/9/4OLxMvl3KzHoeX07v/4+PTz+5GYy/7//Ziezv/fi/zc2PPQhv/x8N/w6bbKnrG22v7k4Z7Nv/fdjYCJw4yTyIa/q/D7+aWbg6Cm0v3Wh4KKxP7fi4OCgI2JgezMhqWag//gifKqoYSMxdXTloGBgNTr5YePxvGdkom/qu/aj8XOms/S6cDNm8izhezakPbTh/nMx8/Rl7HWy/v////8/eTx7rbZz+Dy7vOwp8Owhf/bh8Df1ebIhqjRxf/r6vb7+t3ChoOMxYuIgafGopeQgv/eiJWPgfTcjvnVh9K6hpiRgpDFtf/gi//giJHBqM7n4IfAr4/BqeTHhvrU0Pb//pPGt7rc0oCHw9fr5fCaj//diPW2rqzUyKPFo//dierLhsTi2ozAqv/hiePj84CGwrvLnf/Zh/n/+uj49oC9rICAgIC9q4C+rIaOxv////GelAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AEsJFJgHVaqDCBMqXMgw1UCBECShwlPJAYOGGBkCKGCq44ABdzygIrLlQZiMKFOduBEAQMdRBkZAcuRGTQ0HIVI2LGIIxqaWHUsJKJQIlRELDCbpXEhqDigmSA4E6GiKgIElcVApkfOAw1KEpEgBiqEAxSWgHRuUYgMFVSMZXw+GDZslk5YuEtCOEtBBUxsfcVPNDWulhaAqZp5M7UhAAIQvojaImky5suXBc6/goDSGBwCXHgdQHU2aqkDMg/0wUjABAeiXo2LLnj37NOqwUbBgyoDI5cPfwH/fJqTn0AcRaIMrFz6Yzxk6gVQAWGxqQIMFPVaE2s69u/dQc73MfkgzhIyY5AIeuUDF4pT79/Djuw9Lww6nFAj0ClBUJwiGF2DIJyB8pAzyBxp9FMCRRwRYYgMqZQDhCRcDVjgFBZ9EQF1jJRyBSidSREJFhSSusQh6IOyAyg9J6NAEiTAW8JoBB8ChQQ4kOJFABTDCONoFC7yBiglCJLBHjz0GBAA7";
nations[25]="SouthKorea#10.2#data:image/gif;base64,R0lGODlhJAAVAPcAAICfw+eIk62trevr67q6up+fn7S0tJmZmeLi4sjIyPz8/Pv7+/r6+vX19f39/aamptPT07a2ttfX1+2HkJ2dndnZ2ezs7IChxoCbwICbwbSUq5OTk+WAi4CZwOaCjf3z9PG7wfH1+fPz8+udpru7u++Gj+WBjJavzdzk7p6envLy8ueIkvnf4tHR0bbH3KS506ysrOaDjpWVle7u7u6psYChx7CwsLOzs7m5ubWUq+yHkICXvu6qssvLy9LS0pKlxOmIkvDw8LSTq/b3+v/8+/LBxsCitqurq/P5/Pb4+96Gk5CZupeXl87Ozo+cva6urtra2ri4uL6+vtWKmL29vf39/sfI2ICYwMWQo+rq6v/9/aS61ICgxO6qsZaWluHh4euHkc3NzeeAif7397y8vJiYmLW1tf/29tTU1OfCyqmpqYCZv7GxsaS51IiavdjY2LzM35KSkoCdw/73+KWYs/f+/4qdv5GRkaOjo+CTn4+uzcPDw72kuJCQkJubm+WAioCYv5SUlNmLmaCgoICgxYCgxrKyspycnO6Zod6Kl+uDje/v7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/ABkJHEiwoMGDCBMqXMhQIIEEIhoyEpGAgERGEJgIEFBhgcIFFTZ6edNwQBwChwxRYKCQAYUnB/ZIGbCwwYEIfghsWDSQBQgeXUCwGDjjSJObBxooRGCggAEZFQR+oBHDhAcPJmLQ+CBwQIEbThEsVNDiAQmBY0ZwWBGgbYAVHEbMcfighQKJAxwITPPHbQAgE3RMEFNEoAOaFwfWMaLILZhEGujkUIJIS2KDSH5MKTGhhCAnNS7UWJLnzOWCVfS40YBFiB1CAGLL4UPkNCMLehnBuXKh0AUusWPvsGLYgkQFEB6QEZjkBKDgwdecGCKQxAMId5c2ZbMBisAQLzJ0XcCAoUOGFyEEWqBgo4AZsQltGogSpk+QgShctNniAgVRNV9EcEMZSik0wB094GFDCiwlxEAKAgyCBhVZNOSDDDAIIIFHCS0ggQAwBCLBRTgkoIJEKiSAg20stshiQAA7";
nations[26]="Ukraine#6.7#data:image/gif;base64,R0lGODlhJAAVAJEAAJ264Z264vzuiwAAACH5BAAAAAAALAAAAAAkABUAAAIsjI+py+0Po5y02ouzDqD7D4YiuJVmIKTqyrbuC8fyTNf2jef6zvf+DwwKcwUAOw==";
nations[27]="Spain#8.0#data:image/gif;base64,R0lGODlhJAAVANUAAP32h/30h+6Ahfzzhv72hv31huLSr+2Ahc2khenMicqkiuC/huW+gdu7qdq9hOjShujavtvPtvPto9ezmdGxkM2hhNe/wf71h9/Xjf71htm8vs2ghdqrjNCph8mkjdWlg+bAmNe0gdO5prWqreXXmu3diceliP72h+XNqd64leTUsuDH5MOch9q4if30hreglsyjiOyAhu2Bhv31h+2AhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaGQJpwSCwaj8ikcslsOp/QqFQpq1qv2Kw2S5t5v+BZIBAum89gMnrNTntbMMTm0a5/XbPSoiKKSDAzJxd2bSAmLBorEAYzBRmEbCkdLyMWKA0zAwSQayQhCh4fDCqZm5wAqABhDhQTHAmEqamctDM0Mbi5NAK3B7wxv7nCw8RTxsfIycrLzEEAOw==";
nations[28]="Colombia#1.4#data:image/gif;base64,R0lGODlhJAAVALMAAICcy+eIkuqKlICZzYicx4CcyeeIk4Cby/7oiwAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAReEMlJq7046827/2AojmRZHmiqrmzrvnAsz3RK3Hiu73w//MCgcEgkEgrIpHLJbDaPzqj0eQBYr9isdqsl1L4rgXhMLpvPZ0NAHWi73/C4/G2o2+/4vH7P7/v/gIF3EQA7";
nations[29]="Tanzania#0.1#data:image/gif;base64,R0lGODlhJAAVAPcAAJHan4DR74DR8IOCgI7anZDanYfZnojZnoDQ8oDP94uIgIDR7Y3anYiFgIDQ8dPrlIDP9oGBgYDP85Dans29hc/puovanaGZgouHgIranoDP9YDO+ISCgLHdy5OPgZSPgejaiZaRgYDQ9Y6Lgbzhw+TUiJrenIKCgOXkmYqHgJ7dm7OmgqqegquhgJXY5r7pmLjfxaDa27vomJfY5OPVitrnq4zane7rm+7pmKWeg6efg6KZgYDO+q+lg5OOgNDqlJLV54DP9OjajOzjkuznmIHXn47ZoN7qka3hmO3tpdvnkfLqjd7JhqjgmZTW45aQgNjJhubtkb+tg6Lb2bytgP3ri4PYnrDg0o+LgO3jjMTmw+zkjPXkiuXnofTtpO3Xh5HcnYnanvLhiaOciNrrsaCZgtbqlIrZnuDTioLXn8GzhIfS7fztjOnqntHjsabim53fm9bBgOjhjNbHhI+MgY/bnfnjhce4gYDS7d7Mh5+VgNrFhdXtlonZnp3em7PlmbSngPLikOnaionS7ojS74iGgN7Ohq2lg7SmgImHgI6KgIaEgIGAgITR8aKagKidgO3rjuDUiYXZnuTOgKqjg6ve1PbcgLeqg8e3gPfpmsvov6WdgITYnoDXn8e1gNzMh77mpYjZoJmSgOnto8vnlaWbgMa1hPnqjfLtmMfhuffojI2IgOvTgIrT6su5gILYn4nS8ZLbndntlOfqj6bb2cvAlYbR8Jrdm9nGhrTlmYDR8d/Oh7viloSDgO/fiuPoooDP+Mu+nNjmrOjWjYODgK+hgPjzj8W6jNPEhPXch8a0g7+ug7ril4vZneXhjd3IgPPkje3snubRh9O+gN3tk4rZnYDQ84vansXmlZeXl4GBgO/fiZjdnNrturyugImGgOnukKughOnhlMKygI7bntrMh52UgJjX4u3uj7fg0NTChoDO95fcnO3biY7bndnpr5/Z25eRgYzT7IDR7oCAgI/anQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AOsJHEiwoMGCoNpkqkWvocN6Ew5KJEjgjAUVZlTlybHI4cOIEw0WqGegk4kHxkr0GDHA40MAIQ0e4BTrRRQQFHZwcNmQw5h6MGOODJOG3B9qWdSxUMCzoTlXw4DGrHftgLs3pJxJk7KqKb0ngMp16SZ1IoNmGbgxg5RMmSKvCjbNOUVm3ryyBwlkYIBECRdcZbz28nBHzKgOaxLcDWrQgKRbstjs0pHoRNMGVCzhgNGqka4AiwmONFDEzw90kS59aNkU0SRxqWIQsuYAdOiBB6zUkQHOF4ULrHmWirOtRiV5GiTYtgu0AIE+r8DkeiBnzwoMXvV4QvNLy4wEEAQsv7BLHqiNagTgYNvyZdk3rz5aGEJV4dy6DQLI679rxAI7XrO0Y0oIXhXiCDLQvDMFAhA4MN5+5YXSxBFVMHGBV/SkgIkd0XQwCDD5QbhfPXws8ckhWATnEQbjsIICCU7YgoAAy4lolxdCqBGPig5FUMwzQ7hBCywSIFCjjXYFE04DTTHyyDSCCHMFECJocCSSdmUTAU/aiOINDTdo4gIPCQiAB5Yi8kQMHZRAQUQF8ASxwZVoktfUMYEkkU6dfAYEADs=";
nations[30]="Argentina#3.5#data:image/gif;base64,R0lGODlhJAAVAMQAAP/+/vfWnPLdwPHYtffs3fLUpr3X7/nw5fHVqvnv4cHY7/zz5/fp1/zy5/jq2Pry6P/+/fLfxPHUqvLexP/+/P/8+vXl0frv4v/9+vny6PXk0LzW7rnU7f///7rV7QAAACH5BAAAAAAALAAAAAAkABUAAAVfoCeOZGmeaKqubOu+cCzPtMfdnKdsfO//G4MBCCx1jsikcslsOpeUhoOxgDyvzswEIYk8sOAkgDAIBAYEQHh9EBQKgsN6jbloLInKfM+vwXCAgYKDhDl+h4iJiouMJSEAOw==";
nations[31]="Sudan#0.3#data:image/gif;base64,R0lGODlhJAAVANUAAIC1joC7lIC7lYC6lIC8le+FmoC8loCCgYC1kYC5kZSwlYCKg4C4k4CPhYW8loCdi/3+/vr8+8bi0K/Ft6jOtYCkje/38pDAn8WYmIu0leOKmd/t5O6FmoCFgoCwkbmel4C6la2kloCWiICrj4S4lNuOme2ZqdGTmIC8lKrQuJvIqu2GmvCFmrHUvff6+J6rluqEmICxiYC1k+qHmuiEl4C5lP///+mImoCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaewNptSCwaj0hk7aVZJZ9QYw2lKBWi2GStFsicWNkwccslYQozcZZcGww+HBhtTq/b7/YbexsImdRRe1sJFC42h4iJiouKglsAKhaMk5Q2jo8XG5WbiJdbMSkQnJuXDAAtEaOkjg4SqpyCIAgTr7BsAjINOLu8vb6/wGwEHgvAxse+ZAYjHcjOx1sEFQfP1b81Ag/W2701ItzgODXh4EEAOw==";
nations[32]="Poland#8.1#data:image/gif;base64,R0lGODlhJAAVAJEAAPT09PT08+qQngAAACH5BAAAAAAALAAAAAAkABUAAAIujI+py+2vAJxO0pss3nrf7k1g+IzkiRrCyrbuC8fyTNf2jef6zvf+DwwKh8RdAQA7";
nations[33]="Kenya#0.3#data:image/gif;base64,R0lGODlhJAAVANUAAN6AgPLNzeOAgOGAgOCAgIGBgaqAgI6AgL2AgNqAgO25udyAgOy3t/W4vNeLjLWAgNe2saWAgPLMzPW7u+agoKaAgLyAgLuNgNm1tYCygIOwgLqRkYiAgJibm4C0gL6mk+ehofLIyNiNjeq1taOAgIKAgIGygeHo6NuAgN2AgP///4CAgICzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbBwJVwSCwaj8ikcslsOp8FVcEYnT6TKtWqtNmUVtnrUtV5TCaPjraZbbvfKswiEFhgTvC8KsXv+/0jIgB0ACIjf4h+KIuMjYsECBUDCgoDFQgEjpooiYkCBgcAFBQABwYCnampAiQcCSEhCRwkqKq2fp8HKSAgKaa1t5uOBBYRAwwMAxEWmcKMt34OABISAA7QfHp5ECl0KRDacCzj5OXmLBcNDRfn7e7vLBkaHx8a8PfuJhksHuP9+AADChxIsGDBIAA7";
nations[34]="Algeria#2.9#data:image/gif;base64,R0lGODlhJAAVAOYAAP+AgIDCmv/9/fvHx//8/IDEnPvBwYrHo4DHnP7v7//6+orLp/ePj/zV1f7u7vPx7orKpvzLy/6AgJyzlfyvr5+xlPW+vPabm9iTibygjfy0tP/7+9aTiOKLhMabi/CFgsCfjITLpvzR0aOvk/agn/WAgP7o6NGVid6Qh9yPhs2Xif3Z2f/+/u2Ggv2AgN2OhvHGwvyAgIrKp4DDmvmAgPT08e2FgoDHnuWKhPvIyPP//r+fjfTGxP3f39eVi4i/mvqwsPeQkP/3992RifiTk/vFxYPMpv7t7fTy7/q1tZuyk/zJyZ+vkviBgPmDg/7x8YDFnf3l5fDFwqGwlOSKhP3h4d6NhYDDnP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfEgFeCg4SFg1iIiYqLiYaOgwFXjJOLj4+RlJlYlo6YmpOcj5+goYMTIBgkSSsEo4ilgicuEkMWEQY5T66wVgAfTCE6iARHAqOlGQA0IwgHNVgmVa6boVQALwUzEFIaRAMsu5YFVzYAKjcBCw9OJQwGQsehOAApUAEyMBRBRRvhnDsAmlRohgRLlB7TSv3oAKCFEiOJBDgw9gnWFQ4AYvjgIWLAkgT+Sk3xgOICkAYKElo8NK3RSkEtXb6M+eqlJJo2b8YMBAA7";
nations[35]="Canada#17.2#data:image/gif;base64,R0lGODlhJAAVALMAAP+EhP/+/v+Ojv+Jif+Cgv+Fhf+MjP+IiP+Li/////+AgAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAARnUMk5k704X8q7PFqYIV6pgGJKmh2ahitLuZkkxvIn2nA+YwELxRK84HK0C0BC6Pl0wotAgtgYn9CEgTW4Yl0FFsD7dOXIPrMMjcSwMEdZcqO4YU+7urOct3/7e2kvfnyDGnFrhjUlEQA7";
nations[36]="Morocco#1.3#data:image/gif;base64,R0lGODlhJAAVALMAAPCYmPGXme6YmPKYmfCYmfKXmfOWmY7MhO+YmAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAARAEMlJq7046827/2AojhcAkN5xoJ3KbqpqIMIrnXG+njahxwTbZBDIBQbCyc+VRDAlT6EgUJAUArWmdsvter+jCAA7";
nations[37]="Uganda#0.1#data:image/gif;base64,R0lGODlhJAAVANUAAO+chO2pg////P/3ifzyif/1ifn0l++Zg/n1m6amoPz1l//+/v7+/vSYgP31oPa/rZ6el/G8n/39/f///fWehO+ahO2XhPzxgP/3gP/1gICAgIyLgPCgg+6ahIiHgPnxgP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAatQM9mSCwaj0ikZ8lsOp/QqFSarE6v2OYAw+16v+AweFDImM/otHqtLhAu8Lg8rhCA7gLHfB8ncP6AfwGDgxF3h3cPgYuMFY6PkI4LiIgHkZcVfxSbnJ2blIgNnqMUjKYcoIenjB4arq+wrql3sbWuTrauEqkMubFZHhCpCcAfxsfIyAZ2dxMIydDR0tPU1dbX2NnXHdwW3t/g4eLh3OXmAObp6uvnAO7u7PHy8kEAOw==";
nations[38]="Iraq#3.1#data:image/gif;base64,R0lGODlhJAAVALMAAPv///r+/f3+/vz+/fn+/Pv//v7//v3//uaGkYixgeeIkueIk////4CAgAAAAAAAACH5BAAAAAAALAAAAAAkABUAAARtUMlJq71Yrs27/6A3hWT5jWZKamp7Kkgsz3Rt11muX0zv/8CgcCgEAIjHYpLIECSejGciCpVSEwargDmweqvgxME6YF7P32na3Av0CAUgoR10M+zsvJ7R6Pv/gIGCg4SFhoeIiYqLjI2Oj5CQEQA7";
nations[39]="Nepal#0.1#data:image/gif;base64,R0lGODlhJAAVAPcAAOeIk7Wwyrelv+mGj/v//+WFkLWrxuyGj+aEj/74+eqGj+WEj/3//+mFj+iLleeCjOaFj+eHkeSBjL/Q5+uIkeyjq+aEjvCzurWtyPz//+2GjrWsx7XC3eWDj7WuyrWuybetx+mWoL+Hn/zw8eeKlKedveOBje2Gj+iIk87f8Oz1/KicvLKNqbOoxOyep+ygqeyhqvPDyLqNp/TIzcGHn/zv8O+vtu6KkvP+/6WpybC41eeNl+aGkcjY7OmEjrrK48/b7eqXoOHo87Wwy/K9wuaFkOuCi+6Di7aNqKuox86Clae419WElK672PbR1baivvXM0eSCjrWMqPCssuz2/aOOsOuep7eLpv3y856s0e2nr7LC3eaDjueGkfvp67alv8bU6O71+7irxceFm8XT5+by+8iInc3e8OqFjvr7/fjc3vC1vNXk8+2Ci+WGkau31bmOqLWMp/XS1uKDj+eCjeqcpauhwO6qsemXoMvX6uaIk7Osx72Ko++SmquXtdGEl7K92eeDjbilv/XM0NaAkP/9/eylrer0/Jqs0dWEla+82eeHks3c7rivyv3+/7S+2aSdvv709bWjvv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/APOEmUSwoMGDCBMizAGJjcKHEBE2MgGnCZWIGBUGgHDij50UGUMWDFAAAAUILACpEJkxwAIACAIdSFTiDMuIQwpYqGADgAI3MnSUuakQQ507CSatqeBAA5MVjBgQPbgBTw2CCS5wMdngyptDU0dKeDFIzhQ6HRYssGCEkB8wjsKSRPBgTpUkIAzoNSCmBSIycgss4oHGzBIcDAgoJpBhUhq5URwEsXJDiSKpYRF60ENkBJYZfcZwIJD5IIYQkQgWutBGxJbGpQluMJSUYIwIGmj8iE3www41BL3AQADgAJ8JvANIcAHFiRbiAIojQV6aZIQuJIpEj47iQJwepfc8HFDQwMeA8+gVHJECJPOjJwLiy5f/RZCkLELCBgQAOw==";
nations[40]="Peru#1.0#data:image/gif;base64,R0lGODlhJAAVAJEAAOiLi+WAgP///+aAgCH5BAAAAAAALAAAAAAkABUAAAJVnI8my70JIwrAWTGC3IdeB2jc5n1MOJKVuaBpVLLum8TmTHerLOY62+r5Mrub0Gf74JBF5TGXvCyhTemTFrVMsVXt9ZUFfVPhxhbcFQ9/wDMNiBkVAAA7";
nations[41]="Venezuela#5.2#data:image/gif;base64,R0lGODlhJAAVALMAAICW1IKX04Ga1fzpif3pioCY1YCW2IKZ1ICZ1v3qivzpi+qJk4CZ1f////voi+eKlSH5BAAAAAAALAAAAAAkABUAAAR30MlJq7046827/2AoakppnmiqplLivnA8EMQQ37DD7Hzv/8Agw0AsFhvIpHLZMDqFO6Y0CYUuBYBCASBYVoVeX1iIKJvLgOW5vASszbuDfC4PLOnyZQA/Zzz+gIGCg4SFDwuIiYqLjI2MhpCRkpOUlZaXmJmahBEAOw==";
nations[42]="Uzbekistan#4.9#data:image/gif;base64,R0lGODlhJAAVAJEAAIDL2YDM2o/anf///yH5BAAAAAAALAAAAAAkABUAAAI5jI+pyzc/mpwmBkDzsroj7nkQGJbmNqbqyrbuC8fyTNf2jef6KPT+DwwKh8Si8YhMKpfMpvMJhRYAADs=";
nations[43]="Afganistan#0.0#data:image/gif;base64,R0lGODlhJAAVAOYAAOGAgOKAgN6AgO/Gv/LRy4eAgO22tYLNgvXi1vXh1eahn/HWxuKMjPLXy+KKi+yxseeonvLVyu/Ew/DKwuyzs+y7tPHSyemrovPTx/DMxeegoPfk3+GJhvPUz+OIhvfl4Pfr4OWbl+GLi/Pf0eGIiOqpouSSkvLez+y7s+ijovjl2uKOjO24t+KFheKEheiko+6+vfLSzfPg0vTWyu7GwOain+21teuxr+24uO66uvLTxezAsuu8tOCIheWfmeuxp+/FxPTYy/PRzeOJhvHOye/Cwui6rffl1+23tu27ufDVxeaxo+3DtuuysOqwq+/Eve6/vuy3suirpOGKieuupu/GwOKKiuKLieiooYiAgIDOgN+AgIDMgICAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfygF2Cg4SCW4eIiYdcjIwHB42MhZNZWwCKiAFbXFqRnlyThZWXmFuanJ+RoYSjpaabnamSq4KtpaexsrS1locMJlYkh7iys7StGg85FDg2DpeoxbtdlUM7TlMpLyJRTB6wxaC7lT8LHDcfG009SlTg0rsFW0FVPgMTGU8hAzPvuvFbjgjBYsQChCVSOqjwl2paJR0RrtAAMYLHigYYGH5yuOUCAgIsDBhAQiBBCY2eOLZAcSJGEShEZFRwgVLVOEsCFACBkURCDQHQcjW8eUmA0aOvov071utWzUYcSWEiBo+pVEVUl66yNfWpMVquEoVjFAgAOw==";
nations[44]="Malaysia#6.1#data:image/gif;base64,R0lGODlhJAAVAOYAAPPFyoCUwIeUvICVwOmTnfPHzIucu4CSwYCUwYCPw+uJk+bp8dKMnYCUv/bDx4GWv4ycu6evr6iwroWXvoSYvYaZvYCRwpeltrq8p6aur5WktquyrYiZvYOWv7K2qoCWwNfPm8LBo9y5xvbjjpOit7+/pf/riYiavIqbvO+wt/zni/3oi+fbk9vRmYmbu5ektqqwrvTij7u8p4SWv9y7yICQv4eTvN3TmNu5xoqbu6qxrvfW2r7Apd7TmIWTvfbFyaixr4GRv/vnjKWwr/PDyOWIk96CkPjY2oaUvaewr9SNnfjmjICVwYicvPLEyoKRvufp8bzApfvni+mTnPPJzPjljfbU1+mrtN6DkPXEyfLAxoCVv/PCyP/+/ueKlP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gFuCg4SFg0oKXoqLjI1ThAEBSTw6OZEDhTQ/AJydnp9UgwEdICwwLyQnBhSDDVsLXbGys7SxgxYhMRwJAS4bGBEGD1uYDImNyIsEggEVIx4JWxMSN0stGTODIg5c3d7f4AWCBxcqGgcBECUrJkIyKAGusLX0suPl5+nrJlLvAcXHkiFbtqXZs2jTelS5lk3QNnAQv4kThEsXL1/AhG2RV6+jKFKmUKliJQigwGQEB3xAgGBIFCBNWDJROaAmDm4RI4oTwFMAkiA1nvjo2dOGACgd613BwrSp06dGsBQ5ifJIlqtYs2q9SiRnzgJJw4qVlYKq2bNeCOzwyratxLFwHDuWRUt3oBUtePPq3cu3L18nXwILHky4sOHDgQAAOw==";
nations[45]="SaudiArabia#14.0#data:image/gif;base64,R0lGODlhJAAVAJEAAIDKl////4DKmAAAACH5BAAAAAAALAAAAAAkABUAAAImlI+py+0Po5y02hmy3rxr6IUiKJbbhabqyrbuu5ojzAL0jef6VAAAOw==";
nations[46]="NorthKorea#3.2#data:image/gif;base64,R0lGODlhJAAVAOYAAPaPk/////ze3/aIjPWFifaJjfaLj/ioq/7v8PaGiv7u7/aKj/eRlfvFx/eeofvS0/m2uPzf4PecoPaKjvujpvaFiveZnfvJzPzi4/zd3veanfaIjf7t7vijpvmztfieovukp/iipveXmvaNkv3n6P7z9PmMj/mQk/7x8vihpPzV1/zY2feVmfm5u/q5vPihpf3f4PzW1/mMkP7w8P3f4fmsr/WBhfeSlfmGif/7+/3e3/iFifq8vvq4uvirrviipfvQ0v7t7f/+/vrDxv3n5/3i4/WFivzY2vaHjPaTlveanveUmP/9/fzS0/zV1vmNkPaNkfaOkoiq0wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfCgFKCg4SFhoeIiYqLjI2Oj5CIUZOUlZaXmJmTT5ydT5qgmlCjpFEEBwJFEQIOBKSvsLFQmAADIQgBTk0BJBIDAKHBkwUNCkEHNSglLgazwpoACyw6PC8MST8XMUsGz9AbSjNHGglGHzREIhPemdE3uD02FQ0BAgzd7JlID0I+LR4QmAwp4CyfpVopYAAJkEPFCgcFgBmMNSJBBwwcFGSw4EqWx1JRPHWSseMECApPcJgQybLlJ4MGI8mcSbOmzZuEAgEAOw==";
nations[47]="Ghana#0.4#data:image/gif;base64,R0lGODlhJAAVANUAAP7ojICAgP/qi/7pi+aElPvmitDCif7qjf/pi83FhZiUgp6Yg9rMip+ZguiFlJaRgLyyh42Lgf3qi/7pjpOPgZKOgKScgf/pitnKiOeFlLiuh8y/hpGNgZWQgIODgKOdg/vrjZCNgcG7hP7rjeWElP7pjf/pif7oi4C1n+eIkwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaGwJRwSCwaj8ikcslsOp/QqHRKPZKu2KyWkHEQtNiqOHUqm8/ockKUbrvdg4L5QzkP3mUAviyQYBohHgERChsnAnt6eycIZQsBARyLZnomlpeYl2UWFQ8dZZmhlhcnJaanqKYHJwwaZRAGICOptCUTKLi5uru8vb6/wMHCw8TFxsfIycrLy0EAOw==";
nations[48]="Taiwan#11.6#data:image/gif;base64,R0lGODlhJAAVAMQAABUAjAAAnAAAmwwAkgAAlgAAmAEBmQoKnQgInCAAhhUAjgAAnhMAiwsLnBQAjA0NngQKoAcAlQIHn/Pz+gQAlwAAmf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAV6YCWOZDlaaKquKUlRFYEcRCkMbL6Wb9+PN53QwpsYjxSDKDjMkQiUI7JWYTZ3okIjKp1QHoUq7oqtFBBcKeUQtpJRz/R0OX7DRb58km5vjfR5Yn1wAYWGFRIQFYaFCxGDRACSkwAODJSSCgmQnJ2en6ChoqOkpaanpyEAOw==";
nations[49]="Yemen#0.9#data:image/gif;base64,R0lGODlhJAAVAKIAAPeTlP/9/feVlv///4CAgAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAM/KLrc/jDKSau9OGsJuv9gKIabFpxoqqrDsL5BK890bd94ru987//AoHBoIxiPyKRyyWw6n9CodEqtWq/YbDYBADs=";
nations[50]="Romania#4.6#data:image/gif;base64,R0lGODlhJAAVAMQAAP7slPvhmIecw5mowuqZnvbmmuiPmeiQlfvejuqYopGkyImcxfbjkJCgvOiQm//rk/7qlOiSl/bkkvvfkJKivICTwf/qiuaHk/7ri+mRm4mexP7oi+eIk4CVvwAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWwoKKNJLkMxQOt7AoEhJPNNJ0IXa7rVcNYm6AwiEEcLpykUmnQ7J4VigQ4FGImEeRymXE+eVJqdXPNbrnebyc6HROx2jOnq86xxdVy/Eyv391kcHJJfWp/bnqDc2lfh2OJg4WNYYCQcpJQlIiCkYyZbZtmnXVrmo+cl547jnmofKpgoKeiqaSsQ5avtqattLp+vLiuW5irwVbDXDh+Pni4RntbBiIlJScpLS0vMTXdCSEAOw==";
nations[51]="Mozambique#0.1#data:image/gif;base64,R0lGODlhJAAVAPcAAOqRoemHmomJiYC6tYC7teyGmeiImu+Im+CMnP/1gP7zgPfMicWYo/CskZyfpu2GmeiFm6WDiaWoq+iDm/zng+iDleCHl4WAgIu0soKAgOiGmv/3gOiHmr+Ai+mGmu+FmP7xgOeBm+uRoe3lm+qJmeqImuuRmIe9uNuBmPCrks6lr8umrOWckoeGgPz5uMyEk7PKyeyUkeuRl+yWloC3su+Mn/CskL7c2ZS6uLnZ1/vUhLXZ1sOir8uwi8azjfzpi+yEnNbXzfKzis3S0v/3iffvo+qHmsvP0+mElerNsO20jPOWp8iMlOqSqp2fpu2FnPbMie2Im/GJnOqPmKCin+6FmfbCjOqNmLyCjqOkgOmJouqQoeqQmNuGlqyNjeyImuuEl//5vreAj4nAu/7xh+WKmPrShde6h+mFm/7ykfK2oNO4k/v4m+qEmu6ik8CEjvvqgqWCieiEm+Gmj9DOpumFmKWmraSjositheiBm+qOmM2AlJeAh/a6jpHBvvbDh6Wnq+2dlOeEmq2pqcKrsqSjo8aZo++Rou+an+iCmdbb4IC5tPPkqvvrq+ySoeiCm+KDms66iOmJmom7tri4u+mGmOmImqajo56fprrZ1//5uoC1sIm9uv7xiYCAgIC4tP7wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AFXgGMOpoMGDCBMqPOinBgJAAwZ8mkixosWLGCeeAFDgAQMMBDKKHDmREwBLlj4gkBCRpMuKJlFa6viRwKKXLmOiDOBBpQQCNDYJHUq0qNGhk05aKiHpCocCVQzB2JEjk9WrWLNqzXQDgIEoggJZAWKgC5glKwrducS2rdu3cAdtefKCDx44b8SgQFOpQocLngILHky4sABEc1r0iJTFh5I+bjhYOmAhQobCmA07YnGGDhVKQYr84aLBkoEDUuJkXh1YAIA2TJwcGaKIUCIPKClbZr1awCEsXkYwSsJmzZ4vdfwC5t1bBCQbOmIgEWKmTJ4mPBw4wMS9u/fv4O0AZzAyI4CcAI+mkEjRyIWm9/Djy5//PsxJDQEsBQihB0oCBaAEKOCABBYoYCdKWQLBBA1QsAEIBkYoISgI6heCCQv8N+GGBSK4YIMPcijigVrIkCGAI6ZIhho/ENHJizDGKOOMNMaYRkAAOw==";
nations[52]="Australia#17.2#data:image/gif;base64,R0lGODlhJAAVAPcAAICAw6Wl1oGBxYCAxoODx////4ODxYCAwoiIyIKCxb+/4ufn9IeHyZGRzf+dnYCAyP+VkYWFyI+PzP+koMTA4f+JicXF5d/f8fbO0/+Dg4ODxICAv/+Xk7u84aSk1vWorJeX0JOTzomOzoCCyYmMzP+TkYKCxvvX2cvL54mJyYCAx5+bz4iIxrrA5rnA5tve8v3JycHA4v+sqcihvv+5tcPA4f/r58HB45CHxMHE5u/K09DQ6tzi9Pqmp+O0w+Ds/bukydzZ64OKzYmCwvjx9Mamxb+738Kiw4iIx4+V06yv24KCxP+fncCpy/+fn4KDxf+Ukv+WkYqKyrq43f/Nys/V7/3///+Ojv+xrZCSzpOV0IyJx/nr7vmnqf/X1/Xv9MbM67u33frl5//g3svL6KCf0v/Q0MC+4c/P6bvA5IyMy4aGx7m64P/VzYaGxv+Kiv+cmP+iof+joP+RkfLK0ZCQzfjw9PLL0v+Wk/+dmf/CvN2wwZGFwcuVsP+6turq9aCk2PXM0v/Ly8PK6v/Y1s+nwP+iov+jo+Tt/MaRr/Kss4qHx8OkxNvc8P2AgL673rq64KCq3f/m5YOP0p6f0v/d2/+gn5CT0MjP7fTT2f/r6Z6h1eC2xpKTzZSUz//Mxf/b2cPD5P/r6urq9ouQz//Py//PzqCn262cyYmNzoGBxoCBxvypqo2Ny/CpsPr6/ffS1qGh1f+lpcyUr4aGyP+8ufXt8tjY7aGf0/+1svzt7//X1f/b28K/4J+f04ODxv/KxP/EvdKvyIKIyouMyvDq8v+jn//At9zh9P+qp4mJyIiIy/+WjqGh1IWLzv+YkPj2+v+dnP+AgICAxImJyoiIyYCAxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AGtJ4rGJBQIkNeDkoYAAwTJKe7Cc0IKgmsWLGDM2aPIhmC4wxDY8gsDBCABSRVh9+uIigbWXMK1NAxATJgNlqWb0KFVMyRkIeGKgckVDDCYSG2rCDBBAqTVqoTq0CAJjTAFoV+bYMVXJCjJIHdhEUGpgwQIDSqklm2DM0iEnDhxkyBAtjiEHTORMkIVjQE0BTAWkrSCtsOHDiKU54uO35rRpLx/DpAYLA51AvLxQ2VXhDSFQgsxkuoNBxxanMSVImJxESKQfmvz4aFQCygtENnJxOjXJ2SrULwVcuCD4aadBXPR8ADJsShQOYZ6ksQWsCyMRkUHcAgEZZgIFClw+ySXSRkahSwMO9GL2jAKAA1mqiDqmaJE1AB5eeaAZuftkYYmsMAJk05QxSx+4QPYeIDkcMYRfBHhCQEx1VFMTNSk84J9MD2gY03sqNCZTTNPc4At/L1FDjVLTmPDLhsDFRIAqF64o4xrNxOLGhDH2+JSNMC2hwB+jhOdjjyrWpIEFBRRggQZHyoRiTEnCNE0IKDRJRggwosaUU1XCBEAraOygxpTAlXVWWkDCJEUEtLQZI2ABFEclA6h1GaNkSjHQQEaABiqooA0EBAA7";
nations[53]="Syria#2.8#data:image/gif;base64,R0lGODlhJAAVANUAAPX7+eiPmff29uqYovr//vb19pGRkf3//rTi0Or69LDgzP729+qaot7y6qvfy//3+MPo2aLcxfb29vb9+vz+/dfw5uP07dHu4vP6+IDJpvn//ZOTk4eHh/7//4PPsIPPsfX19f3294qKiuaGkemSm+mRm4mJieeIk////4CAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbAwEFpSCwaj8jjIHBqOp/QqDQaKE2vWOkwy81uu+BoKTAqm8/otDodYJDe8Lh8Tp8zQvi8/rHQ+/MLD396KIWGhwkEh4uGBAmMkIsYDREQFhSRFBYQEQ0YkZEACBkeFQeRBxUfGQgAoJEXCg6uoAAOChevkRMoHRqvGh0ovJEgxsfHAiASBcjOIAUSIMrPxhsi2Nna29zd3BsmKeLj5OXm5+Ym4ejs7enr7vHs6vL15yYc9vrjHAbq/wADChw40EAQADs=";
nations[54]="Madagascar#0.1#data:image/gif;base64,R0lGODlhJAAVANUAAP/39/T28v6moYC+m/6cl4rAofT28/+alsS0ov+kof6rponFpMCtmZHHqv6sqJPFqMWzoYDAnIfDo/r29f6kn/+joInCov6jn4PCocCum/+cmYDBnYnDpP6loIC/nf6emf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaYQJBwSAQBHJeOcslsOhXFKEBA+Fiv2KyWEi1Oq9pwuNMlfsVoLLksPKfTa7b7LY6X53StvYvPq9ltVH5jgEYJBxqJiouMjRWFExAMGZSVlpeYCIUBGBEbn6ChoqMLmwUDHqmqq6ytHKaorbKyr4ABp7O5q7Vst7G6ubxlvsC6wl3ExbPHUcnKrrDPshKFBg8WHNna29zdDUEAOw==";
nations[55]="SriLanka#0.6#data:image/gif;base64,R0lGODlhJAAVAPcAAMDQisuKoIC2lf+/gOe6hP/rgP/uiee7j8uJoOK0kcyMn4C4ld7bhc2On//ogP/bgMuLoP/ngM2Onv/qgO/KitCTndOYm8qIoezEjP/tif/qkfHOiM6QnuvDjO3Gi+a7j9SZm9aemcyLoOKzkuS2kee8j96slPnchPjahNKWnNSamunAjeCwk//qh+/JivPRh9OXm//oiPzhgtzahea6j+a5hIC1lu/Liv++gOO1kf/cgOi+juCvk/nbgfncg//agPDMifvfgu/hguW4kP/pgL/PitadmdOZm/+3gNqkl9Wbmv/piP/ph/zigfDNidqll/reg/PSh9GVnNWdmeW3kOGykuS2kP/sgPbWheK0kv/riOCuk/rdg+7Jis+RnuvCjOrBjfHNifjdhOzFjPvggua5j+Gxk//ugP3mgd2rlfvfg/TUh+m/jtOXnNumltihmP3kgfjZhcyLn92qld2plciFou/LifTUhuO0kf7lgOzFi8qJoO3Hi+m/jei9jvDLid6rlNGUnNigmP3jgcqIoN6tlNSbmvvgg/XUht6rleO2kd+ulNullt+tlP/ric6Onv+4gP/qiPLQiM6Pnv/siM2Nn/+5gIC5lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/ADUsiUSwoMFIMSJRWsiwocOGkTQwETKDgUUGPR5o/KHDAQoKGySJHEmy5IYbPlo4KmJjgcsFNSDJRIJjAgkeFiBU2smzJ08IKraUyOAIgIBLSC8RsMQU0oAJORD1CfBIgoRHWLNqDdDhxQGiRpMqZWrJaYERk5RMWru2QSUJlQKIaMBWSYMPBooeTbq06YACCS5UmvTIyCQ5HCxwgKGoUAUFjyZVunAgb1i+ZM0mQEDYiwkLc8CsWUGhBIkcTypImBSgsl6xfcv+3TypQaAqKfhE+YLBjpMsVoZIodva8l6ksTVzrnSECogOFCh8CKDCxBs/iyCwdn0ZeebZy0Ps/6jQyIMLDGNeBIFzKImI7cZhfwe8nISLBkPQyGhyZQIRB2eUwVlxr2HmF32TiMDDH2wM8l8EDkSQhwMTABIAfAV6dyBtELAgiRpkRCBiBD6g0EQQFQxGYHdjbciZAol48IEeWMgQRhIUQMFCHDCoyN1xLcqGYCWC4FEJIRgAMUkdbpxgBBeMKIAhi8nNtsdgbilAhxgYIJDCAXd0cYIFlShAWXwGCjnCBW2shdURIaRQSQUgWBACCBxMMsUkNKCpoZBmrNABVViViWWZCiggAQQeSEIDUSy9BJNMkNA0wQg7pIGAT5zuBIEhJgw1UUUXZbRRRygAEVJJrI500gktCAx00KwxaPHQrQ9FFBAAOw==";
nations[56]="CoteDivorie#0.3#data:image/gif;base64,R0lGODlhJAAVANUAAICY1fCXhLSYsICa2/X3/Iuj2oCZ1oCV1ICX1eykmJ+z4O3x+YCQ0oSa1uudkLTE58jR7fXQyYmf2MvW7vGfjYSd2Pb9/+qZi4eh2Lqftrmdsq+/5ZGo3I+n24mh3fDIw7OXsLrJ6bvJ6ZCn24Se2JSp3MvW766/5YCY2u+WhIWj3omh2fXMxemRgoCa1uufkv///+qXiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAa0QM5qSCRKSgSYcslsOpUYl9RlMEwBheRz+1xNXaTKNcstM71UxmnDsGK15rIXoIAsFhAF4B03oxshSiINLnx9XGgHDyYTDweFZIdbaC4jCAgdUoaSTpQAmpqRnE0eA6anpygqFqNOGQKwsbEgGh8st7i5urssERQBwMHCKS3FxsfIycUXLzHOz9DR0tPSL83U2NnV19rd2Nbe4dPg4uXO5Obi6OneLw7s4g4J1vT19vf4+AlBADs=";
nations[57]="Cameroon#0.4#data:image/gif;base64,R0lGODlhJAAVANUAAOeJk+aHk+aFk+qVkuiNkvCukP3kju6okInDteuene2ikeOYn//xipHFuf7rmuCOluSAlP3mmOqQm/7rlPnUjPvcjI65rumVlOiPm+6nkPfLjYfBs/7qkuWBk+eKk5e/tPCxj+mRm/3lkOGQmOmXlpC6sIC+r+aGk+mHkv7qi4nBtf7qlOeIk/7oi4C9rwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAblwIZqSCQiPgtJaMlcYhKRyWpKpTo2rqxWa7I8UKywOHy6GFKttFrNUW3fptIIPBafSCL0er1yv7lydHUsd3l7fH5/LnFzg2R4eoctfYpZjIJ1hZGHlJWXjoSQkmmdip9hHh52oqOlf58CEBkZEAKhhq2Jr4EsCgUUFAUKt5t7rnCBAQMaDAwaAwGao5O6yI0dIBUVIB3E08dbnwAHBAQHAN65lYu8AAIBAQLo0uqevI70kuCAjfis+tXC3RuUj1NAfpjGFDR20NLATP84YfHkJaEdM8XWcBBSpMiRJE2aPIlSpaSDIAA7";
nations[58]="Angola#1.0#data:image/gif;base64,R0lGODlhJAAVAOYAAIGBgOaEk+aGk+eHk+iPmbOCieWCk7evhe2kke6SnO2IlOqYopGRkYuJgeyikcO6hoeHh+aFk+PViLqNkvzqi721hdjMiO+tkLOBiq+ohNDFh/foipOQgfXJjvrfjKOigvbNjZSRguiNkuudkf/0i7+2heqXkrOBidrOiJGOgbWHifPAjvC0j9TJh9Sqi8yniq+Aifvni4GAgPjUjfnAj/nBj93PiOqIk+eJk/HhitTIh8OZio2LgdzPiISEgOaHk7SthO+Rk7mxhby3hfjVjfa9j9bKh+K3jLSxhL20heWBk+yIlJKQgeiPkuuBlfzti/bQjeyHlMi+hqagg/fniq6ohIWEgO6qkMS7hoCCgN/SiPvji+mPkpmVgt7RiO2JlLSEiemRm4mJieeIk4CAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfzgAthg4SFhoeIhwsEY42Oj5CRkpEEYZOXmJKDmZyZm52NOAIGAaCfoBEjKyyknKecPxEOUDEdDqWYr5kiF1cDJh5EYwO5lp0CCBQUCEpNWyACuQlf1NXW1Qo3XDQ1QVFORTNLCtfWCRNg6err6gUuRzAnKmAYL087BezrE2Jk/v8AAX4ggQTgEC1ZAgYU00+hQzJJqOhIQaZBDiMP/zHMCJAHk4pYbFTR4MUKRzIbT5KZssGCkAM9WqDIoDKlygMPJEgoEaLLgwo+ONpUSQaAjH8AgEgBkHEoUYUcmD50+rSqGAhVs/6DwICh169gw4oVyyAQADs=";
nations[59]="Chile#3.7#data:image/gif;base64,R0lGODlhJAAVANUAAICY1fCXhLSYsICa2/X3/Iuj2oCZ1oCV1ICX1eykmJ+z4O3x+YCQ0oSa1uudkLTE58jR7fXQyYmf2MvW7vGfjYSd2Pb9/+qZi4eh2Lqftrmdsq+/5ZGo3I+n24mh3fDIw7OXsLrJ6bvJ6ZCn24Se2JSp3MvW766/5YCY2u+WhIWj3omh2fXMxemRgoCa1uufkv///+qXiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAa0QM5qSCRKSgSYcslsOpUYl9RlMEwBheRz+1xNXaTKNcstM71UxmnDsGK15rIXoIAsFhAF4B03oxshSiINLnx9XGgHDyYTDweFZIdbaC4jCAgdUoaSTpQAmpqRnE0eA6anpygqFqNOGQKwsbEgGh8st7i5urssERQBwMHCKS3FxsfIycUXLzHOz9DR0tPSL83U2NnV19rd2Nbe4dPg4uXO5Obi6OneLw7s4g4J1vT19vf4+AlBADs=";
nations[60]="Netherlands#11.5#data:image/gif;base64,R0lGODlhJAAVAMQAAJeoydmVmtyfo6Cxztydo9iUmp+vzdqXnNaLkpmqyo6hxPz29/b4+9mWnJmpyteOlJCjxf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWBINGMZGme6EkET+u+cCzHQTPfuDzmfL73wFijgCgaj8ikMlkQHJ7QqHRKnQoW2Kx2y+16I+CweEwum8/otHrNbrvf8DNjTq/b7/j8IMHv+/+AgYADAAqGh4iJiouKAA4QkJGSk5SVlA6Plpqbl5mcn5oOAKCklQAGmKmqq6ytrQYhADs=";
nations[61]="Kazakhstan#11.1#data:image/gif;base64,R0lGODlhJAAVAOYAAIDX5YDY5YDX5ora5IXY4Ira5bDcw//lif/lisnfsojZ58zfsL3euv/kjpHc58PetofY3o3Z26XbysXftafcyY/b4YjZ3pHZ2PXjlb/euYPY4b7euc3fr5na0oTY4a3cxaPby87fr6LbzeLhoKLbzIfa5YLY44zZ25na04fZ3qncyObincvfsJfa0/fjk4bY37fdvsHeuM/grpXa1bjdvpHZ2b7euoDX59PgrK/cxI7b4bjdvd3hpZTa1Z3b0IPY4pPa1sbetMjfs53bz5Xa19Pgq6rcx8Let5La157bz8/frt7hpJza0Y7Z2drhprveu+PhoYza5K7cxYvZ3bTdwMXetYjZ3bLdwpra0Z/bzqjcyLXdwJXa1pTa1ojY3sbftJra0o/Z2bvevIHY5Kbbyq7cxLrdvdDfrsLetYva5LndvILY5Ina5YDY5Ija5YDY4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gA4KCm6FhoeIiYqHDm4qUh5tb5OUlZaXmJMlAws4FgGZoaKUbAMJMhaSo22qo6QFNlUErZisEBCsrpNsUTAML7SWbQQgBgYgs7psFUELEQChJhQxIyMxFCbKOkdCJ9CYABdqGAcHGGYX36JsBVtPGsGTbQItHAgNDQgcLQKupRMLUoCyFKCHhA4h7uUL0YEMkoGZ2CU4g+uSABRLhuxwUc4FjSROuvQL9Y+FwEsAmkDRIuLBihUPSFDgYQUiJnZUxMC71OZHBgNMRBjIQQLMBwZrRi17kMAbJgEXMkjwwQUFliwbIti8WeELi2eZAISpMeMDEQkMgIxcl8YXsFAANARMuYJGiZEx8S6x2zAhmagAwwDcyKvXlAwvhIUlLrygyCddkEk5KhMpcuQSgggt2syZUSAAOw==";
nations[62]="BurkinaFaso#0.1#data:image/gif;base64,R0lGODlhJAAVANUAAIDOpfaMl//FjveUlv7Hj9rhkoDNp/+kk/eTl7yxnZHVsYnWrNbgk/3jjJLSofecnYfRqfeRl+rqjvvIj/mnlP6anvikpIrRov6QlpnUn/zpioPPo8HMmf/qisG4pP6SlbyynYDSpfeen4nTq4DPpPeVlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAatQItoSCwaj8ij5VFqOp/QqDT6EE2vWOkwy81uu+DoN0wujbuDAfmcRVAoiDD7GglMJoEIWFT5+P+AfhgHAgQNDQQCBxiBjR8VHiCSk5SSCSAcEh0dEhwgl5WhHgshpaanpwYMGhoMBqiwpgsjJLW2t7YADgUZGQUOALjCtSO0w8IXGwAAGxfHwsXPuMu11NK20dfa0tnb3rjd3+Lh4t4jEOXlEArF7e7v8PHxCkEAOw==";
nations[63]="Cambodia#0.0#data:image/gif;base64,R0lGODlhJAAVAOYAAICAyOiJidKitvzt7dKjt/zv7+SAgP/z8Pvr6/rn5/vo6ICAyeyJiYmJ0oeHz/rm5pGR08+JnMuAk/zu7omJ0f/z7/nh4fPExPni4vrl5fXMzP/w7f739+qXl/zV0dOnu/rk5PTIyP/49OyMiOaBge6oqP/v6+mAgM2Ln/vs7Pvq6syFmeeGhuuYmOuamvrj4/vt7f309O2mpvTHx+eKivG4uOyenvXNzfTFxfvn5/ng4P319fK7u/ne3vri4uaKivG6uvKkoeucnPKlof/08O6np/nj4/G5uf/x7eWAgMuAlOqAgICAzoCAzYmJ0OaAgICAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gBBOg4SFhoeIhxAOUI2Oj5CRkpEOTpOXmJJOFE2dnp+goaKhFA1Mp6ipqkydq66oDRFKs7S1EhK1Kyu2uLW+EQxLwsPExSdBQyfFy8QMAU/Q0dFJLR1JT0lJFxfZ2B0t19LSAc/i00A8BkkkJRkZJSRJBkc1BubR5PfYNhYYRT8uVCBAoMIFDRk6eggJZy7fvSQaUihA8CBBghwKKj5AoGDADYbiHJozEILDhBgwBhRIMWDCBBg7BnCYYe+eSGnycCAA8QDDCws+QFh4gSGBEQQX1Nksh5OFhgIKEqgsMADBgKkTEigoEIIFSGgBghUb4UHEgQ0mKhxYi0Tt2gomRzYQEeFhxDIGsnyh+EBAAIG+AgL7Fey3L4EPKHwpiWBKVRMAkBcsgByZcuTJkJusasBplOfPpCxlGo3JCSPSqCkJSsS6taJAADs=";
nations[64]="Niger#0.7#data:image/gif;base64,R0lGODlhJAAVANUAAPCkgJfiq/zw6fGvi5/fqozZm/GuivCtifz///318Pr28PCrh/3x6++ngfzv6PLMtfXayO+jgPbMt/O7nu+kgPvf0vzu5vK0lPCphPCsh/KujZbcpJbdpJffpozamvndz/rg0vCqhO+lgJbdo/zu5/v+/IPXkvCogo/anvGvjIbYlf////CpgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbIwEtqSCwaj8jj5cBqOp/QqDR6SE2vWOkwy81uu+BoanAqm8/otDo9sHZDGYMhEwKnBKS8fq9nWD4SEh8WDHyGeQIriouMjA4TCw0NCxMOjZeYmSsJKRQnTScUKQmapZggEVERIKatiwIYIk8iGImurhUaALsAGhW3JcHCw8MIChAPDxAKCMTOwgQj0tPU0xwdAdkBHRzV3tIEBSbj5OXm5+jnBSgq7e7v8PHy8Sjs8/f49Pb5/PcoHv0CyvOwoZ7BgwgTKlS4IQgAOw==";
nations[65]="Malawi#0.1#data:image/gif;base64,R0lGODlhJAAVANUAANiHkLmEituHkemRm8iGjeuJk+2JlI2BgsGFjJGRkY2JiaaDh5WBhKWDh5GJiuqQm62DiJiChOqRnJqChMWFje+JlKbNoaKDhp/UoYKAgOOWnMKFjIqBgr+Fi+yJlL6Fi5GKipuChbuFi72Fi4eHh6iDh6fVqLOEibKEiaeDh6DRoY+Bg5+Chp+CheCRmpKBg5OBg4iAgd6IkemIk5/JmuiHk5jQmuGOk4mJiaDToeeIk4CAgJnPmgAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAb7wARuSCwaFSCQwsgsJki7qHQazYROiM0GcQplqOAdCReerkSEQGMyaQQIolVZOpzvXpRO5HBBoS4HER0UMHZ1ZTEIHwctAh4GBh4CLQcfCDFzh2ElBAwsBhUFogUVBiwMBCWZDjGtrq4pCxwQIwG2tyMQHAspr74OLjLCw8MCAjICAMrLysfGxNAuEjPU1dbX2NnYEgM63t/g4eLj4gPd5Ojp5efq7egDDzXy8/T19vf2Dxo3/P3+/wADAtRggYbBgwgTKlyo0AIGGxAjSpxIsSJFDDl4aNzIsaPHjx5zZARJsmTIkSZTksyhQqXLjypMiJxJs6bNmzdNBAEAOw==";
nations[66]="Guatemala#0.9#data:image/gif;base64,R0lGODlhJAAVAOYAAMfl8cjl8svm88zn8+Lx48bl8c/o9Mbl8tPntdfs17G0o6jNpvDw6rbZtrLBicbjxP/76/704uvz6fb19Pb798Xjwd3s0c3lzdrr0a/Dhd/s39Xq1t7t1criwLC3psfjx9Lmsv3+/fD06/b288vkysfWr9vhv+Hw4f3138nYuODt4Pv9/KnNp7jaueLx4v/v4Pj19PTw3e3y4fb18MnjytrW0vn69ery5cjm8sHj8cLj8cvn8/n8/vv9/sfl8v///8Pj8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAflgDs+g4SEBQY9P4qLjDwDB4WROwBAlZaWOQKJjJw8ATqXoQA+oZc5O5ucizw4oKWVg6+Vp6mqP6yur7GytLarrbJAu6+9vrfAssOlxYohnci6pLyoihorDCkUKoq4wcqhvScNNhAmHS0ux7ml36bUJBs/KC8IDxfq3tLE1B8JMDERQFSggS+ZvmXUCLCoMUFEiQUECkYLVsyDAxkcMijgBo3dQXDUfozAIOGGhRkc14Vqhymkr24GKbq0BXPitFqqanqUifOZykssZ83M2XElJV6ajN36FAyAoEiGECl1BAnqoB2BAAA7";
nations[67]="Zimbabwe#0.8#data:image/gif;base64,R0lGODlhJAAVAOYAAPHcgOmXkL25lf/kgPjmgJeQj53Li6bPjNTT1JW0iZXIgJWtjf/ugJCKif7mjPWVhp3OiZ/NjP7lid/d4M/RzpjKhPvqgJGuhv/sifjpie/fgOeLhKHNg+fl6vGPiKbQlZzIgPKMhfGekNONgPGXkfTaqsS9ofnU0v/+/+7u8/Pn7MqGg//6+u2LhPz97/z27fzz5fK0g/ri3ObSgPn+//3nkvbahcSMiPOxsPnx1fjIxNLV1fjei8O/rfbUlf3084mJicS8utLQ0PPai93f3/CwgPbYhPXYqe/WisS5t/nos/jos/DWg/vNy/bIx/719e7w9v7+/vHWhPn4/8S8oP7k4/GnnPnmovDXivv43/nWh/OvqvXbht3g4MvKzPzf3OyBgPnMyubRgPrghsPCr/fv08SLh/GwiPfbpoCAgcrHyu/VgPP1+vCdnfbKiffpt/XLvsuHg/zjidLT04CAgPCOiIeBgOePh/CWh/7jgPjngP/rgJ/Lg5bIhJ/MjP///yH5BAAAAAAALAAAAAAkABUAAAf/gBQJEBF+hoeIiYqLhx9/CBcKFX2UlZaXmJmUBn9/EwsgHHyjpKWmp6h8B51/HQIaFgR6s7S1tre3Gax/UCYADHvBwsPExcUYrFFVKmRiA3nQ0dLT1NMSnTlXVk00QSMPeOHi4+Tl4yKdLjVFbZ1ecSEedfP09fb38yQ/J04+cmc4wnwRcmPDnYMIEypceDDAky1g3DhwEKOFjj9dCtjZyLGjx48bG3SCo4XHkDElWO1IQ6ely5cwY9IB0ikLFyxIbLzpREQjyJ8gRf6BYYSJlDVl/swxY5ChU4YBOsk4skQJmhdqVsTDx5UriU4sUHSakuSbubNo8aDbxabHjGfVMuLKzXONVQoqv4zp3SsMWSdXsGThGkx4li5PoESlWsxY1aNIkzRJnrxJECFGmDMj+hAIADs=";
nations[68]="Ecuador#2.0#data:image/gif;base64,R0lGODlhJAAVAPcAAOeJleeHk4CVyeeIlOiKleeGkueJlOeHkoCVyuqJlImYyeaDj+eKlumRnO6JkuaCjoyUwvbS1uyJk4mdy+aEkK673PXL0MfT6sXR6Oru9eiGkeqGkf339/vW2d+Lmf78/Iebyv7//4Kay4WbzO2nsPG6weXe6Y6UwuqTnuKKmMbS6emTneWAjMnT6eucpvTL0OmUn96LmdqGlomOvenEzpGjzrGy0YufzJSTvueIk+CLmeWDkMu4zaaRtai22unt9qWRtvazuKi225Oax8aNpfCJkYiczomcy/zu8J+02u2lru6Wn+KjsM2csv/19OiOmaSLscGmv+ry+vvq7ICQxKOz19+JmMKHofzw8u+vt4CVyKu52tygsOuLluiFkO2Kk+yhq+qHku2Qme6stPrl6M7W6vbQ1e2osMeNpcWOpu2jrPTIzuqSnO+wuKeRte2JkoCPxumSnfvp7OmJlOmTnqSz14CQxcrT6Ons9cXP5oKXyICUx6i22Yiby+eKlYCPxICVx////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AJsMMdKnoMGDCBMqPFhDTAwgAgQAmkixosWLGCeCoJNAQhoICPaIHEmypMmTe47Q8UPAgYceI0TomUmzps2bN2+s9OMnQRguJqT8wEO0qNGjSI1m2MmTwIYlHQJJnUq1qlWrTA3kYFCAQhYsV8OKDbRzQAMXAfwAWBAnQoixcKWuZPBAiQUWPP0U0MDERpIqdQILHkx48BY6A1asIcMhwpkDPAF4kQGFip3LmDNrzqxgZQASHwK98GMgr58iKXBIzMh6gmcYU+SUeJA3wI4rM+D82c27t+/enf0cAKPmSZvSa9nQaHHhjvPn0KNHL7MTQIEBARgcoDAGSdy4TCMvUGhg5vv38HO+BHFi/nzTN1aiYFCRp779+/jz47+zsiOaEwjY8duABP6mAAoO6OBGRKw12OAEXRABkhYOVoiRHjwI4QMfHHbo4YcghuhhBQEBADs=";
nations[69]="Senegal#0.4#data:image/gif;base64,R0lGODlhJAAVANUAAOLxivz8hP79g++Sl4nLqvj6hP//gfr7hOPyiv38jPP4hofLofCdmvT4iO6UkYLHpI3NoJnTqur0iIfLqKfYmf/9gvz8g7Hcl///gO6Slfrvh/z+jLDcl/rxkpDPoqPXmtPrjoDGpK/cl/X4k//+gpHPr/Cbnfz7hP7/g//9g/78g/v7jZLQpPT4ivrvie6Wk/z+g4DHpO6Jjv38g4nMqe+Ul/v7hIDIo+6LjgAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAb6wBJtSCQSIqPEaslcbjqMQW1KpZomt6xWG/M0ZrawOAzTOGS4tFqdoW3fMVYLPBbDXC/0el1zv7lydHU2d3l7fH5/N3Fzg2R4eoc4fYpZjIJ1hZGHlJWXYjOCmpJpnYqfNgIAAAKPhqSmf5cBJBgiIhgkAaOwibJyKQAXHAsLHBcAKJCkk75wcioHIBAhIRAgB7ySsc9zJwYUDw8UBifanM5blwISHwgIHxIC53vc6oEBCgUVFQUKu8t6VVoUyIYFOjMsEAq4LR2gRo7oIRqIapBENfYeYhpzsZRDSwUjMuSExZOXjXbMbNqTQUiRIkeSNGnyJEqVmyaCAAA7";
nations[70]="Mali#0.0#data:image/gif;base64,R0lGODlhJAAVAMQAAJDcpJncnvbnjv/qk5nfqqHgpvvhmPvejuiQlZHco/7slOqZnuqYouiPmeiQm/fpmP7qlJrdoPbnkOiSl/vfkP/oiofaneaHk/7ri+mRm5PdpP7oi4raneeIkwAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWwIKGNJAkUzwCt7KoYi5PNNM0kXK7rViBUm6AwiDkgLp2kUtnQ7J6WiAQ4FGIoE+RymXE+eVJqdXPNbrneLyc6HROx2nOnq86xxdVy/Eyv391kcHJJfWp/bnqDc2lfh2OJg4WNYYCQcpJQlIiCkYyZbZtmnXVrmo+cl547jnmofKpgoKeiqaSsQ5avtqattLp+vLiuW5irwVbDXDh+Pni4RntbDSIlJScpLS0vMTXdDCEAOw==";
nations[71]="Zambia#0.2#data:image/gif;base64,R0lGODlhJAAVAOYAAIrGgJePgL+NhPi/gPONiPWRiO+QiNSehve/gPe+gPfDiYjGgJTKiYbFgInFgInGgJzNkYvGgLTDgIvFgIfIgJHAgLTCgIjHgLOyg7Kwg7KugPmKiZ+wgY/CgOOvgPuOic6pgM6ugPfCiNiogNSvgN2qgJCxgP2+gLiogMO1gKO6gKa3gorDgLO3gOm0gJPJiO25gJfAgJHEgIrEgIesgJO9gJK8gIWtgMasgNapgJ27gPSNiP3CiZHHhbCvgNSrgMSkgI3EgPfBhY3AgKS5gMOugK6xgLrHibu0gIfHgI3DgJeMgNichqi4ia6+gInJgMWvgIzEgJPHh7Cxg4/KiZrAgMywgJPDgP6+gMGKhJ3Cify/gKS2gK62gInKgIbIgOCzgJq9gJPJh5W3gIasgICAgJXJiYzFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAfxgBBmg4SFhoeDDIiJEGJnj5CRkpNnQR0OCw8OMxMADwssUmaUpJMRYzgpXVVOSBUxRC1FTaOlto9KXCQlOS4wISAjHlZatbe2C0MqRlBgP0A+YVGKx8cRD0k2KBo1DgBng9WlFxQUX08yOldeDe1UxuKREysZUxgcNDdkJhISFkfw4j0CwGTDjg9ZyihcsgXLCR4BBQI4QMBAAQEKywRAMCCBgojxJla8mHFjx48CJYm0iFGhSY8gxa0k6ZIjzJSRZrbUaBMlzoEUWZbsGbOazqEnix47WjPpT6Ajd770+ZMpz5Mvnp6x+lJED61cbQoJBAA7";
nations[72]="Cuba#2.3#data:image/gif;base64,R0lGODlhJAAVAPcAAOeJleeHk4CVyeeIlOiKleeGkueJlOeHkoCVyuqJlImYyeaDj+eKlumRnO6JkuaCjoyUwvbS1uyJk4mdy+aEkK673PXL0MfT6sXR6Oru9eiGkeqGkf339/vW2d+Lmf78/Iebyv7//4Kay4WbzO2nsPG6weXe6Y6UwuqTnuKKmMbS6emTneWAjMnT6eucpvTL0OmUn96LmdqGlomOvenEzpGjzrGy0YufzJSTvueIk+CLmeWDkMu4zaaRtai22unt9qWRtvazuKi225Oax8aNpfCJkYiczomcy/zu8J+02u2lru6Wn+KjsM2csv/19OiOmaSLscGmv+ry+vvq7ICQxKOz19+JmMKHofzw8u+vt4CVyKu52tygsOuLluiFkO2Kk+yhq+qHku2Qme6stPrl6M7W6vbQ1e2osMeNpcWOpu2jrPTIzuqSnO+wuKeRte2JkoCPxumSnfvp7OmJlOmTnqSz14CQxcrT6Ons9cXP5oKXyICUx6i22Yiby+eKlYCPxICVx////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAj/AJsMMdKnoMGDCBMqPFhDTAwgAgQAmkixosWLGCeCoJNAQhoICPaIHEmypMmTe47Q8UPAgYceI0TomUmzps2bN2+s9OMnQRguJqT8wEO0qNGjSI1m2MmTwIYlHQJJnUq1qlWrTA3kYFCAQhYsV8OKDbRzQAMXAfwAWBAnQoixcKWuZPBAiQUWPP0U0MDERpIqdQILHkx48BY6A1asIcMhwpkDPAF4kQGFip3LmDNrzqxgZQASHwK98GMgr58iKXBIzMh6gmcYU+SUeJA3wI4rM+D82c27t+/enf0cAKPmSZvSa9nQaHHhjvPn0KNHL7MTQIEBARgcoDAGSdy4TCMvUGhg5vv38HO+BHFi/nzTN1aiYFCRp779+/jz47+zsiOaEwjY8duABP6mAAoO6OBGRKw12OAEXRABkhYOVoiRHjwI4QMfHHbo4YcghuhhBQEBADs=";
nations[73]="Greece#8.8#data:image/gif;base64,R0lGODlhJAAVAOYAAIiPxfb3+4WNxImRxoGJwrC12IKJwpeeza+02Pb2+pqfzba729rd7tbZ64ePxYOLwouSxtrc7dTX6vn5/OTm8o+WyYCHwa6z2Pf3+9nb7fX2+oCEv46WyICFv4SMw7a6242Ux4qSxtbY662y14WMxNXY67O42srN5a6z14CCvvz8/rG22dnc7dTW6oOLw5qgzqyy1qKo0o6VyIyTx93f76yy14mMw4aOxIyUx5CXydvd7r3B35qfzoCDvq+12Nja7IKKwoCIwdfa7Pb2+5GYyf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gAdERDk4GUUBChyDjI2Oj44HFQAADg8NRQlEApQAHkCgoaKjpANElJaYmpyeOxk/sLGys7JCDBAGBgQdEkUaEBa5GzRFxcbHyMlFCwXNNRRFEx8XzSMnIkLZ2tvc3BHKySgpQeTl5ufnAwFDAesqxRjs7SYzkPaOCjyMICxFGC8VBoFoMaSgwYMIEw6RIUAAiSAlMnFw0TCIDnAYkZ2qdCnTJko3YqzwQbKkyZMmESwIQaDlhl6/LLQ00KGHzZs4c+q0sQCBDwQwoEm7gLKo0ZIqMypdakyh06dQCyq4R7VqIwUD0GndytXcgAjdwoodu+0b07PgGAihxbatW1i2DwaQmku3rqgBgqzqtXcgEAA7";
nations[74]="Chad#0.0#data:image/gif;base64,R0lGODlhJAAVAMQAAOqPoY+dsv/qieuXp/3gkJmluImZu/3cheqPoOqPnOyZpP/riZGhv/fhhffkkIeZuf/pif3eh/fih5Gfs+qRnf/pgICQteiGmv/ogOqRoYmbuv/ngICStOmImgAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWwIKONJGkUjgCt7LoQCpDNND08XK7rVtBgm6AwWDkkLp2kUonQ7J6WiQQ4FFYiFORymXE+eVJqdXPNbrneLyc6HROx2nOnq86xxdVy/Eyv391kcHJJfWp/bnqDc2lfh2OJg4WNYYCQcpJQlIiCkYyZbZtmnXVrmo+cl547jnmofKpgoKeiqaSsQ5avtqattLp+vLiuW5irwVbDXDh+Pni4RntbCCIlJScpLS0vMTXdAyEAOw==";
nations[75]="Portugal#6.1#data:image/gif;base64,R0lGODlhJAAVAKIAAMTR6P///+zkgYCxme6SjwAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAANXOLrc9DDK2SqbONude9yWJ4KV6JGDoK4mRq6w2n6bPNkziEe7WdsBQODBylmKgCSxdzoChUvBjPDrwaa6IuGKzcaYo9d3CkFdyDTzAJ02s8vq9ZsanxMSADs=";
nations[76]="Belgium#11.9#data:image/gif;base64,R0lGODlhJAAVALMAAP/vhv/ujo2LgPmOmvqUmvqRl/qWm/mKmPmMmP/thoCAgAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAARrUMlJlUgg6c3LQWAYDlWpYFyaGJ/ompWqsu4LT3JK1+GN55sdD+GTAIOtYfF0XCV5y6ZzCIo2hdCiFFuLZoBcmw8Ffna131xY5D2ue2i3WXwjq+fseJlK1N/5VnKAWk0EeHBjGgEBihx8IBEAOw==";
nations[77]="Tunisia#2.3#data:image/gif;base64,R0lGODlhJAAVAMQAAPOAh/OAiPOAg/OAhfOAivKAgPOAhPOCi/OAhvSNlPekqvaaofSJj/SJkvOAgvelqfepr/abov/9/fiztfi0uvSIjv/8/Pi4vf3p6/GAgPm9wf/4+f////OAiQAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWFYCeOZGmeaKqubOuKzSvPYmAIwyAYAY0SCICCQ+QoAAiCj0QYJIpFCycxUC47AAbx4VhAOQzAtSMgLgrfouAaOBALEY4EMoEeej5A403ZaCoZF0UNYj5tb3FzdUV3V2UcZ0QYX2tXWVtdX2FjTU9pU1VjHUBCUEdJoiM2ODo8qa+wsbKyIQA7";
nations[78]="CzechRepublic#12.2#data:image/gif;base64,R0lGODlhJAAVAMQAAIGcu4qkwIGdu4miv4KkwoWjwI+owvv//4WfvYOkwZyyyYahvuiGiYiivoehvrXF14eiv+uDhqO4zeqKjYejwOqDhoiiv+uKjf///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAV0oIWNZGmeKGoFYuq+prUALWyrloVY0u2TuWDu8bsJcw6LoQg7HhXMlNMZPU2FDUGgCrweaZhD1Hsc5Kpk54URqbjf8HjlkhZe7vi8fl+37P+Ad2mBhHxHEEEThYuCU4yPdDkFCX6QjxYUBDmWkEGclpWfkCEAOw==";
nations[79]="Hungary#5.9#data:image/gif;base64,R0lGODlhJAAVAKIAAOqZneiPlIDFoemRloDGo////wAAAAAAACH5BAAAAAAALAAAAAAkABUAAANFOLrc/jDKSau9OOsZuv/NJ4JKZwFoqq4qU7xwLM90bd94ru987//AoFBIKBqPyKRySRA4n9CodBplWq/YrHbL7Xq/4GUCADs=";
nations[80]="Serbia#6.8#data:image/gif;base64,R0lGODlhJAAVANUAAPfngICrzuOeoOOcoOOdoN+oqt6hpuGmpuKfnoCqzty4m+Keo9e/mt+qp+Oen9y9rNe8nd24qdqpneOfouWcn+Kdo+Odn+Scn+CpqoCpzuKmp9ivnIirzN+pq+Kgo4iqy//9/v76+9y1n4Csz+Ocn4iqyuWeoNzb24CqzeOeof///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAamwJRwSCwaj8ikcskkCgYIx0DQrAoJno5CVJgQrEwSBhABAB4AjQU8NLnfpkuDYTZDDhS4fv9GGiobdQASC2xCKCWJihwoQieOhx+Kk5SUKJeYmI8pJ5snmaChmCOil52cj52lqygBq52wsKyiAa6lsbEoCbOgtqKenigZvMSNjpspxaAqzM3NQ6dCztPU1dXH0tba28whKp0qINzj5OXm5+jp6uvaQQA7";
nations[81]="DominicanRepublic#2.4#data:image/gif;base64,R0lGODlhJAAVALMAAICRreiClYCRrICOquiAkuiBlICTr4CWsOiEl+mHmanOwICWsemImv///wAAAAAAACH5BAAAAAAALAAAAAAkABUAAASIcMlJa7uY6c17/RSGBV25gah4kWaJgmrDttz7xTOt2Zaa64uDcEgcLmKFhHLJXDIWhqh0Kj0qrooGAcHteruMmPiCxY7PaEz5mm6L11m3nLyez+FzxnfPDasGVIFRCwxNhkp+IgJFjEKEOhwxADwTkJEqk5SPlokYmZScGpKam5ajmqGdF6QLEQA7";
nations[82]="Rwanda#0.1#data:image/gif;base64,R0lGODlhJAAVANUAAP/tiYDC5YC/6vzslIHC5IjD3oC/6//vj5nG0P/vkazKwdrSnJrHz4rE3L3Ns4XD4IzE2pTG1MbPrYLC5IzE3JfG0pzHz43E2Z3HzYPC4oLC4oTC46PIyLHLvY7E2ZHF14HC5c7QpoTC4qXJxorD3r3NtLDLvrfMuYfD4JnG0ozE24bD3//thoC/6YK9r4C+rPzri4DC5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAahwJhwSCwaj8ik8hjQeBCYSCEWWFqHARGiBIOFFBfC9Qr6OLrdxQg1XgYmFjT6pGorA4SUvNsh2e8UCnISDBt/SgQQHF0mFQ9Vh0kBGQUNK1RDLZqbnJ2enQICBgahmjF7qKmqqzAHLK+wsbIsrF2zBwO1urUDubu/qAMJAMTFAMCqxgnIzGgvLtDR0tPU1dQv2Nna29zd3t/g4eLj5OXm30EAOw==";
nations[83]="Belarus#6.4#data:image/gif;base64,R0lGODlhJAAVAMQAAPaMkPeZnYDUqfeZnIDTp/mYnPeYnPeanfebn/3j5P3l5veanvaWmviMkf7t7oDTqPaOkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAVpoCM6UGmeaKqeJOQEwCrPZvvGdJ7aBq7/rtINCLQNfESabYFMymyIplNllE5RtoP1WhPCuE/vlsuwFXSNtHrNTgff4JXtQa/b7/i8fU7Q+/UCgXRzf4V/hIaJdwlCio51Co2PjiMOk44hADs=";
nations[84]="Haiti#0.2#data:image/gif;base64,R0lGODlhJAAVALMAAPv8/u+Hl67Jo4CPz+qHmYCK0Pf5+oCKzeqDl4CJzO6BkeqClumImoCQzwAAAAAAACH5BAAAAAAALAAAAAAkABUAAARQsMlJq7046827/2AojmRpDaaHplLSAIAgGEBzsBSs1wU+1bDXh0EsGo814ouhCDifUOdxWkQwZFgBY0HteomEbvhLLpvP6LR6zW673/C4NwIAOw==";
nations[85]="Bolivia#1.2#data:image/gif;base64,R0lGODlhJAAVAMQAAOuNgvzxivvxk/7ykf32ivzzkvTfif/3iv/3ifvziv31iujaj/rxi/DYif/0ivrzi+rgkP/0if7yiYC8n/zzivvxioC9nuyPggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAV04CWOZGmeaKqubOu+cCyrQG0Dc3nncOX/wKBwSCxQjshkEmFpWg6UBCWoPAqIwQDEaVkwAljgNexTXLiXB5hcGZMJZ+dlyq4MJHgJUeIwkBoReYKDeHWGWFyJiouMixMTjVyPk5SVlpGYmZqbnJ2en6ChnCEAOw==";
nations[86]="Guinea#0.2#data:image/gif;base64,R0lGODlhJAAVAKIAAIDJsP/piuaGk/7qi4DKsP7oi+eIkwAAACH5BAAAAAAALAAAAAAkABUAAANWaLqs9TA+QqulLRvJCwHXpTWd9IXWyJTRiWKqw07gS8Ty7L74Nns2WOwHDPaIQaEKmTz+kjcc0yh9Nqu663CQpQ6t3iXY5uySVQJfKVA8f9dtHpYFTQAAOw==";
nations[87]="Sweden#6.2#data:image/gif;base64,R0lGODlhJAAVANUAAP/riP/rh9jXnuPcmICrz//pioCp0Imz0f/tkMvQpf7qlIeyz5G40/PjkImx0+/hk9bWn4Cn04mw1NvZpc/VrP/skeLcmcvQpuXfn//piYCtzcvRpYCq0P7oi//sh4m00ICtzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAa7QMZnSCQ6JghFBXM4FJ9Q4gJErVYJgkAHMNBorOBw9SOmYrVcb3kNIpfP2+6XLXaL4ek5HWwP4+V7YX1gf2qBVhIciouLERBoFgYGjJSVixQbmZqaFw8ZHQUNCQmbpaaaCB6qq6wFHa8FrLKzsgqvt7i5uru8qbSqrrC/w6uYpxudn6Gjx80biZYcjpCS0dYcg1aFeodta9vdY99ZcYbh2VfkeeFU6GbqgOxTb/Dm3UJRH0dJS035/x+CAAA7";
nations[88]="Benin#0.3#data:image/gif;base64,R0lGODlhJAAVAJEAAP/ngP+XpYfhvQAAACH5BAAAAAAALAAAAAAkABUAAAJDlI8Iy+0PkjywwjmtZlju3SWfFipjVVLnlQorm75P68oNHeT6zvcB7gv2gMLir2U0EpO+JZPnfOqi0mOqOkRid1RpAQA7";
nations[89]="Somalia#0.1#data:image/gif;base64,R0lGODlhJAAVANUAAP///53C7pvB7Z/D7p/E7qXH75zC7p7D7qbI763M8OTu+qHF7pnA7fX5/brU89/r+ejx+8ne9sDY9L7X9LbS8p3D7sXb9cTb9bvV863M8bnU85zC7e/1/Nfm+Ja+7L3W8/H2/cLZ9LDO8f7+/8bc9bjT8szg9prA7fb5/qfJ8KDE7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAaAwERqSCwaj0gkQsVsOp/QaDQlrVql1Kv2mt16od2vWBXWEgbjsvWQcQTE6mhA4DFBGIKNNw7VXCYcACQhEgUEWnxOAyIKAI4AIB97WwEnD44NBQKTWgMFKAodIyUGnFcBFBEHDBgWFaZXCwaHpQuwY7e4iLpwvF9LvltCScTFSEEAOw==";
nations[90]="Burundi#0.0#data:image/gif;base64,R0lGODlhJAAVAOYAAIjYl4nYmIvZmuWBjOWCjeaDjvj9+eaFkOeIkuaGkY7anI3am5vep+aEj/7//u/68f78/Pn9+u2lrf7//+eKlMftzv3z9P3//e+vtumUnZzeqI3Zm/75+qDgrN/14+758JXcovv+/P3///jc3+qbpP/8/Kvktuzs5e7x6YzZmu6ss7PmvOWAi9iXltqRkuiQmvG4v9Tx2dPw2Pj/+/XT1vje4ZPcof/7+7fnwOyhqfja3sTsy4jYluuepvf8+P319onZmLbnv5bdo+ygqZPbn+L15eudpv319f3//vTJzvG8wvD2796+t6fispTcof/9/ajjs/f9+OaCjf/9/pLboPjb3uDMxK7kuOeLlfb89/fY2+eKle2mrvvq7MPryu6ttOz57/TKz/G6wdfy3IrZme/t5/P69fXO0v3+/fzx89qoo4vZmfPCx57fquaFj5Lbn/K9w/vp6+qWn+L25uTOyOPOyO2osOmRm5fdpOeIk4/anf///wAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gHt7TzQkFC93iYqLjI13LxQkNE+CH4J7R0oUBAh5np+goZ8IBBRKR5cfDDsGl3EqDQWis58FDSpxlwY7DCA8GjGXezpGAwefCVIDA1IJnwcDRjrCMRo8IHh6AgFQc5clYXcDCQR3GGxsGHcECQN3YSWXc1ABAnp42Xp6AQs4D5cWYGARY0GYBTFYYBQU9ADHggD67uXTpwCAkwoRLqURFIFOnYx7NnKs4ASAgogSUepbAKDNGGF7zLRoYQbmmDYAFqhMuVPPmgBXWglCU6YMGl1XAqzpybNnCiFRYMKMIiQF06Y7BXS4sMfAEiSCkCxpdaGDPab4rpKhkmUCExcn2wSdcMFkQhYqZK6m3VnRRoUQIqyoQSEIhRorIkJUsGGy516UQDYE+SdowgxhMyZcehBkA5Cdj7UFaFLkEgQtN6Te0ALhUpEm9VDuZclAhoNLI3qwGFKFgyAOVYaw6DHikgMZDHLqw1fxjRcfl7p8iZWngBs5EiTIcSPL1pcul3x4eWMSDxEBK8Bc+gFnC6dRBwoUONDJE6ktcH5cArNCABETHlwyxRkZjEMLLe1kcMYUl3hgwm2C1JADAcccaOEBBORQg3GCQJAEFxLYIeKIJJZo4ogScJFEa3sEAgA7";
nations[91]="Azerbaijan#3.6#data:image/gif;base64,R0lGODlhJAAVAOYAAOqamYnPqYnK6N+foeiQj+uamYnRqZrGponK6eyZl4zJ5YjOqIfK5/fZ2OeMipC+nJHO6YXNp+eMi92ZnP///+2mpe2npvXMzOeNi9yXmemPjuXAw+mWlOqZmOufnuqXlv7q6fG4t+uRjuiNjOyXleqOjOeLieeLiuubmuaJh4LB4OuPje+xsJC8mvXR0O+zsu2lpIK/3uKytdyUl4LC4d6fofrl5fbT0u2amOaIhvbT0+eOjO+mpPfKyP7z8+eNjPjd3fK/vpHAnuiOjPPEw/C1tOiRkOiPjumQj+qLiemRkOuQjtyYmumSkJHBn4PE44DNo4jK54DG5+iSkIDG5oDLogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf1gBBRg4SFhoeIhxAMVI2Oj5CRkpEMApOXmJIClpmdmJueoZoIUqWmp6ipqqkICk+vsLGxNDEqsre3CgNMvL2+vTM1GzITGb/HvgMJS8zNzswlOCA9PCRJKyLP2swJAFPf4OHfDi5AKScVRB0E4u3fAN7u4EY7NkEmPzoULxjy4vD+wDlocCOHBBYNPBwJCA5AASUQI0qEOASGjxAoPmhA0mSiR4gFADQZSbIkyREWLhThQMCky5IADjiZSbNmzQctHgixydPmAQNQggodSrSo0aIGAlRZyrSp06dQnwZQGrWqValUr2qtGmDB1q9QF0QAS5ZphEAAOw==";
nations[92]="Austria#9.4#data:image/gif;base64,R0lGODlhJAAVALMAAO2Vie+fle6ek+2YjOuNgP729e2Xi////+yPggAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAReUJhJq734CoC6/2AohoAxnqg4pWy6tnBoAERt33iu50Aw/MCgcEgcBgrIpHLJbDoP0Kh0Sq1ar9isdsvter/gq3NMHvuK6LSRtmu7eaaYvPOax+r21iwfA0gygIEaEQA7";
nations[93]="Bulgaria#6.2#data:image/gif;base64,R0lGODlhJAAVAMQAAOybkonPvO6ake2hmInOu4nQvI/LupDSwOaflOSWi+ySiIbHtIDKtoDMt4fOu+yZkPj8+4DLt+uTif///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAV04CSOZGmeaKqubOu+cCzPtAndeK7vfH84wKBwSCwWCYykcslsOp2BiHRKrVqv1yh2y812v99CY0wum89otGHBbrvf8Hgckajb7/i8Xi9Q+P+AgYKDgwASh4iJiouMjIaNkJGOkpSUD5WYjQMPnJ2en6ChoSEAOw==";
nations[94]="Switzerland#6.0#data:image/gif;base64,R0lGODlhJAAVANUAAPri3+qHgPbHweuNgPfSzfO7tOuHgPbMx+2Yje6ek+yViPjW0ffRy/fNx/rg3v/9/eyOgfjW0v308vfPyuqDgPK0q/739vCpoO2Vivvp5u2YjPnc2PXDvOuMgeuLgf/8++2Th+mAgPXEwOuLgOyOguuIgO2Xi////+yPggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbewIRpSCwaj8hjQoFqOp/QqDSqME2ho5J2O7o+h95m51Iomy+dMAocNixO8PjCoGZ7S4R4nFCqW8N4enB8fk8kJQGJiiETgicTIYqKJSRffygQIBwCnJ0iGY4ZIp2dHCAQTnYDCA+Orq8nDwgDqZcDGhawunEWGrRNqggfu7sfs7VOAxgbAM3ODhKOEg7OzhsYv2uXKCQj3t8jFAyODBTg35XIhiTs7QZ5ggQG7fRQdleB8X1h91MGEY4i0OG3bYqHCg0OKDzQoIKHQmqybNHSpQ4TNRinKBCSpKNHJUEAADs=";
nations[95]="Israel#9.7#data:image/gif;base64,R0lGODlhJAAVANUAAOfu+srZ9LfK78LT8pSy6LbL8Obt+vX4/fz9/4Ok5J656tzm+Jm06cPU8vL2/KK965y46u/z/NLf9cza9JGv54ao5Ymp5Ymo5YCk5Pf5/aa/7Imq5pOy6Ja06MHS8p666v7+/4mm5M7c9Yus5r3Q8ZWz6Zy36uzx+8jX84Cj5OXs+oCf4oCh4+vx+4Ci45az6IKm5P3+/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbIQJlwSCwaj8iYcslsOp9QxWtKrVqv2Kviwup6v+CwOHwJrc7otHrNXocmqLh8TkcFAvW8fILsSyR9gYJDERwcEYOJRCICDSUPDyUNAiKKgwAEJgUHBwUmBACWgwMJMUIxCQOigg4fFAEZGQEUHw6rfR4MGhUQEBUaDB63SAgyIAsdHQsgMsXDgSQkqwAq1dbX2CoGBtnd1gAbKeLj5OUpGBjm6uMbFi7v8PHy8/TzFiMw+fr7/P3+/SNOtBhIsKDBgwgPnngmKggAOw==";
nations[96]="Honduras#0.9#data:image/gif;base64,R0lGODlhJAAVAMQAAImq38DR7oeo34ys4L3Q7b/R7pSy4pGw4fL2/JCv4bbK64mp34mo346t4e7z+vP2/PH1+/T3/PP3/Iur4Iep3/n7/vX4/YWo3oCi3ICh3Iip3////4Cj3QAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAWh4KGNZGme6HkIXOu+cCzHAjDfuAzYeY/vvqBugSkaj8ikMrlIUJ7QKGUkhVKr0YRly+1uHwgvF/EQizfotBpdCKzThcJ7Tk8H3GgIxI6v++kKCn+Db3dpDg58hH8BBHQEjn8Vk5SVkxIRlpQREpqaBhOhoqMTAwOkoqaopAYMGa+wsbKztLMMPEK5HEC6uby9QQAswEECDRfIycrLzM3MDSEAOw==";
nations[97]="ElSavador#1.0#data:image/gif;base64,R0lGODlhJAAVANUAAImY04aW0YmW0pSh1pKg1pCe2P//+///9Iyb1oua1aS0s4ya1OXl2unp5cO9uuXi0OTl3ZSerLq8tYmapcHCstnZy7y+rfTz7v/97a65m/n38O/r3aKytPX08ebm446bmvT2+/X2+5KkrNnc4ZWhsfj49Jyfnoyb09rd4v///P///au3p///75Cbm9PSw5yfn8C5tvDu6MLDufT1+t/d0Iua1PT1+4CNzoqY0////4CQzwAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAakQAJuSCwaj8gjIaBrOp/QqDQaAEyvWCnAmu1it96wVnArm8/otDotGNTe8Lg8cVok5Pj4wMbv+/8zGhsxJX+GfzmJiouMBwweDRAHjJSVloopNCQwDhEPKpehlwYSIhkrEzIGoqyULh8KHC0VrbWKGBYvJhQstoe/IRcjKB0gv4dueXkIBQUIynkDZGvU1WxcYtk6YNrZ3N1hAEzgYQFCSejpSkEAOw==";
nations[98]="Tajikistan#0.8#data:image/gif;base64,R0lGODlhJAAVANUAAP/42f///f/1y/717Yi4i4m3if/98pK+kumRkf/99P//+//99f73+Yi4jOqSkvb02////pG8kf/++//99v/0w+iJioa3hvby0ueHh//0yP/964i5jf73+OeJif/31v/85/b69//54f/1yv///P/ytv/+7//87//87v/2zf/20fb02fb02v/2zP/+7v/xtf/20vb69oi3iP739+WAgICxgOeIiOiJiYm5iYCzgOaAgP///wAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAbWQERtSCwaj8gjApNrOp/QqDSKsU2vWKnNmu1ibZ2ZeEwum8/mjmPLbru3lcp7znbI7vi8nsMYDBgceoJ5OoWGh4glHxoaHy2IkJGShiMTBoUGEwGTnJMeCzoCIjoLHp2niBIQOi8pOhASqLIJAIUhIYUACbKnASYAAhkZAgAnm7ydCiwkFBQuKAqyMNPU1dUgDxcqKxcPINbg1BEx5OXm5gQbDQ0bBOfv5REFNPT19vf4+fgFNzj+/wADChwo8EY/gggTFrSgsKFCCwcMSpxIsaJFiweCAAA7";
nations[99]="Togo#0.4#data:image/gif;base64,R0lGODlhJAAVAOYAAP/sgO2skeiCm+mHmeiFl+6Fmf///+iGmOybquiGmYC3p+iEl4m6rqqjoemLnOeDm+mGmYC0quqPoIC3qOiDlvri5/ja4KmjofCqkeuTo//+/vjZ3//+/+yEmu6Am+iElu2frfTEzeqLovG0v/PAyv77/P329/rCiaWho/74+cq9lPK3wvTDzLPLl8mvmIm8ruqMnamiof/vgP/7/P/ugO+FmaWfo+6zmf/qieqQoOXekeeAkeLgiO2erfbBiv/qgLCpqPnd4vTBy+mMnemDm+W6j+eBlOiClfCOoOyZqP/pifjW3Ie5rJG/suiDm+uRoueClOuTpP/tif3z9f3x8+uXp/nCiemLnbPMl+qRoemImoCyqbPJl//ngIm7rePciIC1p//pgIC0pwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAkABUAAAf/gFVZg4SFWUhAL16LjI2OjxJakpIEA5NaBQ0KYJydnp+gWZcHCDCWkgUXE2Ksra6vsKIDBwcUFiBHB5YFMauwv79ZA1cZDggaLAlZOQNERTxf0dLT1NXCDiFUJgYlU0EIBA9WNGHl5ufo6aIJBCMzBgZLEgtaTj4AXfn6+/z9olofonBIYYDEDkkPTshIx7DhPyhCNmRZUWEIBC0dXGDhwrGjx48g/2npAWGBkSRPEmipgSLClpcwY8qcKbISpVOZNoHauVOEgJ9AgwrwYMPlzKNHbwRYyrRpAAwqWoCcSlUKgKtYs1790bArOiX9woodyw+H17Noy+moxratW2oMF4DJnQssLt27dJnw3MuXZ5NHgAMLdhQIADs=";

var randomNation = nations[parseInt(nations.length * Math.random())];

return(randomNation);


}


/////////////////////////////////////////////////////////////////////////

// 	F'ING BIG MASSIVE ARRAY OF AIRPORTS BELOW, PLUS calcDistance

/////////////////////////////////////////////////////////////////////////


// function to return value for airport

function getAirportLoc(location){
	
	var l = new Object;  // l is for location

l.DLC="38.95:121.53";
l.HRB="45.61:126.25";
l.URC="43.9:87.4599";
l.HTN="37.03:79.85";
l.KHG="39.53:76.01";
l.XIC="27.98:102.18";
l.CTU="30.56:103.93";
l.CKG="29.71:106.63";
l.YNT="37.4:121.36";
l.SHA="31.18:121.33";
l.TAO="36.25:120.36";
l.HFE="31.76:117.28";
l.NKG="31.73:118.85";
l.NGB="29.81:121.45";
l.HGH="30.21:120.41";
l.FOC="25.93:119.65";
l.KHN="28.6:115.91";
l.XMN="24.53:118.11";
l.KMG="24.98:102.73";
l.ULN="47.83:106.75";
l.XIY="34.43:108.75";
l.ZGC="36.51:103.61";
l.WUH="30.78:114.2";
l.CGO="34.51:113.83";
l.SZX="22.63:113.8";
l.SWA="23.4:116.68";
l.NNG="22.6:108.16";
l.KWL="25.21:110.03";
l.CSX="28.18:113.21";
l.CAN="23.18:113.25";
l.TYN="37.7299:112.61";
l.TSN="39.11:117.33";
l.HLD="49.2:119.81";
l.PEK="40.06:116.58";
l.WGA="-35.15:147.45";
l.TMW="-31.08:150.83";
l.SYD="-33.93:151.16";
l.RCM="-33.6:150.76";
l.NLK="-29.03:167.93";
l.DBO="-32.21:148.56";
l.CDU="-34.03:150.68";
l.CFS="-30.31:153.1";
l.CBR="-35.3:149.18";
l.BWU="-33.9099:150.98";
l.UMR="-31.13:136.81";
l.PER="-31.93:115.96";
l.PHE="-20.36:118.61";
l.LEA="-22.23:114.08";
l.KNX="-15.76:128.7";
l.KGI="-30.78:121.45";
l.KTA="-20.7:116.76";
l.JAD="-32.08:115.86";
l.ADL="-34.93:138.51";
l.MEL="-37.6599:144.83";
l.MBW="-37.96:145.1";
l.LST="-41.53:147.2";
l.HBA="-42.83:147.5";
l.MEB="-37.71:144.9";
l.ABX="-36.06:146.95";
l.AVV="-38.03:144.46";
l.WEI="-12.66:141.91";
l.TSV="-19.25:146.75";
l.ROK="-23.36:150.46";
l.PPP="-20.48:148.55";
l.MKY="-21.16:149.16";
l.MCY="-26.6:153.08";
l.ISA="-20.65:139.48";
l.CTL="-26.4:146.25";
l.CNS="-16.88:145.75";
l.OOL="-28.15:153.5";
l.BNE="-27.38:153.11";
l.ASP="-23.8:133.9";
l.ABM="-10.95:142.45";
l.SIN="1.35:103.98";
l.XSP="1.41:103.86";
l.QPG="1.35:103.9";
l.SOC="-7.5:110.75";
l.SUB="-7.36:112.78";
l.WGP="-0.66:120.3";
l.SWG="-0.48:117.4";
l.DPS="-0.73:115.16";
l.BMU="-0.53:118.68";
l.AMI="-0.55:116.08";
l.SRI="-0.48:117.15";
l.TRK="3.31:117.55";
l.BPN="-1.26:116.88";
l.LBJ="-0.48:119.88";
l.KOE="-10.16:123.66";
l.RTG="-0.58:120.46";
l.ENE="-0.83:121.65";
l.MOF="-0.63:122.23";
l.PKY="-2.21:113.93";
l.PKN="-2.7:111.66";
l.BDJ="-3.43:114.75";
l.PEN="5.28:100.26";
l.TGG="5.36:103.1";
l.MKZ="2.25:102.25";
l.LGK="6.3099:99.7099";
l.KUL="2.73:101.7";
l.JHB="1.6299:103.66";
l.IPH="4.56:101.08";
l.KTE="4.53:103.41";
l.KUA="3.76:103.2";
l.KBR="6.15:102.28";
l.AOR="6.18:100.4";
l.BTJ="5.51:95.41";
l.RGT="-0.35:102.33";
l.PLM="-2.88:104.7";
l.BKS="-3.85:102.33";
l.DJB="-1.6299:103.63";
l.SQC="0.05:111.46";
l.PNK="-0.15:109.4";
l.KTG="-1.8:109.95";
l.MES="3.55:98.66";
l.PDG="-0.86:100.35";
l.GNS="1.15:97.7";
l.SIQ="-0.46:104.56";
l.TNJ="0.91:104.51";
l.PGK="-2.15:106.13";
l.TJQ="-2.73:107.75";
l.BTH="1.11:104.11";
l.SRG="-6.96:110.36";
l.PCB="-6.33:106.75";
l.CXP="-7.63:109.03";
l.JOG="-7.78:110.41";
l.CGK="-6.11:106.65";
l.HLP="-6.25:106.88";
l.CBN="-6.75:108.53";
l.BDO="-6.9:107.56";
l.DUM="1.6:101.43";
l.PKU="0.45:101.43";
l.MLG="-7.91:112.7";
l.SBG="5.86:95.33";
l.BWN="4.93:114.91";
l.TWU="4.3:118.11";
l.LBU="5.3:115.25";
l.BKI="5.93:116.05";
l.LDU="5.01:118.31";
l.SBW="2.25:111.96";
l.MYY="4.3099:113.98";
l.MUR="4.16:114.31";
l.KCH="1.48:110.33";
l.BTU="3.16:113.03";
l.SOQ="-0.91:131.11";
l.MKW="-0.86:134.05";
l.KNG="-3.63:133.68";
l.AMQ="-3.7:128.08";
l.LUW="-1.03:122.76";
l.TTE="0.81:127.36";
l.PSJ="-1.41:120.65";
l.MDC="1.53:124.91";
l.PLW="-0.91:119.9";
l.GTO="0.63:122.85";
l.MKQ="-0.51:140.41";
l.WMX="-4.08:138.95";
l.DJJ="-2.56:140.5";
l.TIM="-4.51:136.88";
l.NBX="-3.36:135.48";
l.BIK="-1.18:136.1";
l.KDI="-4.0599:122.41";
l.UPG="-5.05:119.55";
l.RGN="16.9:96.11";
l.THL="20.48:99.93";
l.SNW="18.45:94.28";
l.AKY="20.11:92.86";
l.PBU="27.31:97.41";
l.MOG="20.51:99.25";
l.MYT="25.36:97.35";
l.MGZ="12.43:98.61";
l.MDL="21.7:95.9599";
l.LSH="22.96:97.75";
l.KYP="19.41:93.53";
l.KET="21.3:99.63";
l.HEH="20.73:96.78";
l.SGN="10.81:106.65";
l.NHA="12.21:109.2";
l.HAN="21.21:105.8";
l.DAD="16.03:108.18";
l.KOP="17.4:104.76";
l.NAK="14.93:102.06";
l.LOE="17.43:101.7099";
l.SNO="17.18:104.11";
l.UTH="17.38:102.78";
l.TST="7.5:99.6";
l.HDY="6.91:100.38";
l.HKT="0.1:98.31";
l.NST="0.46:99.95";
l.PAN="6.78:101.15";
l.NAW="6.51:101.73";
l.PHS="16.76:100.26";
l.HHQ="12.63:99.95";
l.PRH="18.11:100.15";
l.LPT="18.26:99.5";
l.UTP="12.66:101";
l.BKK="13.9:100.6";
l.MLE="4.18:73.51";
l.PBH="27.4:89.41";
l.TRV="0.46:76.91";
l.TRZ="10.75:78.7";
l.TIR="13.61:79.53";
l.RJA="17.1:81.81";
l.IXZ="11.63:92.7099";
l.MAA="12.98:80.16";
l.IXE="12.95:74.88";
l.IXM="0.83:78.08";
l.HYD="17.45:78.45";
l.CDP="14.5:78.76";
l.CCJ="11.13:75.95";
l.CJB="11.01:77.03";
l.VGA="16.51:80.78";
l.BLR="12.93:77.66";
l.AGX="10.81:72.16";
l.BIR="26.48:87.25";
l.SIF="27.15:84.9599";
l.PKR="28.2:83.9599";
l.KTM="27.68:85.35";
l.BWA="27.5:83.4";
l.MFM="22.13:113.58";
l.VTE="17.98:102.55";
l.ZVK="16.55:104.75";
l.PKZ="15.11:105.76";
l.LPQ="19.88:102.15";
l.SXR="33.9799:74.76";
l.PGH="29.01:79.4599";
l.IXP="32.2299:75.63";
l.LKO="26.75:80.88";
l.IXL="34.13:77.53";
l.LUH="30.85:75.95";
l.KTU="25.15:75.83";
l.KNU="26.43:80.35";
l.IXJ="32.68:74.83";
l.JSA="26.88:70.85";
l.JAI="26.81:75.8";
l.JOH="26.25:73.03";
l.GWL="26.28:78.2099";
l.DEL="28.55:77.1";
l.DED="30.18:78.16";
l.IXC="30.66:76.78";
l.KUU="31.86:77.18";
l.VNS="25.45:82.85";
l.ATQ="31.7:74.78";
l.IXD="25.43:81.73";
l.AGR="27.15:77.95";
l.HKG="22.3:113.9";
l.DAC="23.8299:90.38";
l.ZYL="24.95:91.86";
l.SPD="25.75:88.9";
l.RJH="24.43:88.6";
l.JSR="23.18:89.15";
l.IRD="24.15:89.03";
l.CGP="22.23:91.8";
l.CXB="21.45:91.95";
l.RRK="22.25:84.8";
l.IXR="23.3:85.31";
l.PAT="25.5799:85.08";
l.IXT="28.05:95.33";
l.MOH="27.48:95.01";
l.IXI="27.28:94.08";
l.IXS="24.9:92.9599";
l.IXH="24.3:92";
l.JRH="26.71:94.16";
l.IXW="22.8:86.16";
l.IMF="24.75:93.88";
l.GAY="24.73:84.93";
l.YOP="26.73:83.43";
l.DBO="23.8299:86.41";
l.COH="26.31:89.4599";
l.CCU="22.65:88.43";
l.BBI="20.23:85.81";
l.RGH="25.25:88.78";
l.IXB="26.66:88.31";
l.AJL="23.73:92.8";
l.IXA="23.88:91.23";
l.REP="13.4:103.8";
l.PNH="11.53:104.83";
l.TRR="0.53:81.16";
l.JAF="0.78:80.06";
l.GOY="7.33:81.61";
l.RML="6.81:79.88";
l.CMB="7.16:79.88";
l.UDR="24.61:73.9";
l.STV="21.1:72.73";
l.SSE="17.61:75.93";
l.RPR="21.16:81.73";
l.RAJ="22.3:70.76";
l.PBD="21.63:69.65";
l.PNQ="18.56:73.91";
l.ISK="19.95:73.8";
l.NAG="21.0799:79.03";
l.IXK="21.31:70.26";
l.KLH="16.65:74.28";
l.HJR="24.81:79.91";
l.IXY="23.1:70.1";
l.JGA="22.45:70";
l.JLR="23.16:80.05";
l.IDR="22.71:75.8";
l.GOI="15.36:73.81";
l.NMB="20.43:72.83";
l.BHU="21.75:72.18";
l.BHO="23.28:77.33";
l.BDQ="22.3299:73.2099";
l.IXG="15.85:74.61";
l.BHJ="23.28:69.66";
l.PAB="21.98:82.1";
l.BOM="19.0799:72.86";
l.IXU="19.85:75.38";
l.AKD="20.68:77.05";
l.AMD="23.06:72.61";
l.KBY="53.5:50.15";
l.UFA="54.55:55.86";
l.PEZ="28.95:-98.51";
l.REN="51.78:55.45";
l.KZN="55.6:49.26";
l.SCW="61.63:50.83";
l.VKO="55.58:37.25";
l.VOZ="51.8:39.21";
l.KLD="56.81:35.75";
l.SVO="55.96:37.4";
l.BZK="53.2:34.1599";
l.TAS="41.25:69.26";
l.SKD="39.7:66.98";
l.BHK="39.76:64.4599";
l.NCU="42.4799:59.61";
l.DYU="38.53:68.81";
l.KRW="40.03:52.98";
l.ASB="37.9799:58.35";
l.KRO="55.46:65.4";
l.TOX="37.11:-92.08";
l.SVX="56.73:60.8";
l.SGC="61.25:73.5";
l.PEE="57.91:56.01";
l.NJC="60.95:76.4599";
l.MQF="53.38:58.75";
l.CEK="55.3:61.5";
l.VOG="48.76:44.33";
l.ASF="46.28:48";
l.AER="43.43:39.93";
l.ROV="47.25:39.81";
l.STW="45.1:42.1";
l.MRV="44.21:43.06";
l.MCX="42.81:47.65";
l.KRR="45.03:39.1599";
l.OMS="54.96:73.3";
l.KEJ="55.26:86.1";
l.BAX="53.35:83.53";
l.ABA="53.73:91.38";
l.MSQ="53.86:28.01";
l.MHP="53.85:27.53";
l.KGD="54.88:20.5799";
l.VTB="55.16:30.13";
l.GME="52.51:31.01";
l.MMK="68.76:32.75";
l.LED="59.8:30.25";
l.ODS="46.4099:30.66";
l.LWO="49.8:23.95";
l.IEV="50.4:30.45";
l.SIP="45.03:33.96";
l.DNK="48.35:35.1";
l.DOK="48.06:37.7299";
l.KBP="50.33:30.88";
l.UUD="51.8:107.43";
l.IKT="52.26:104.38";
l.BTK="56.36:101.68";
l.HTA="52.01:113.3";
l.VVO="43.38:132.15";
l.UUS="46.88:142.71";
l.PKC="53.15:158.45";
l.GDX="59.9:150.71";
l.PVS="64.36:-173.23";
l.KHV="48.51:135.18";
l.BQS="50.4099:127.4";
l.SUI="42.85:41.11";
l.TBS="41.6599:44.95";
l.EVN="40.13:44.38";
l.YKS="62.08:129.76";
l.ADH="34.8:-96.66";
l.BAK="40.46:50.03";
l.KTQ="53.2:63.55";
l.AKX="50.2299:57.2";
l.PLX="50.35:80.23";
l.URA="51.15:51.53";
l.DZH="47.7:67.73";
l.CIT="42.35:69.4599";
l.OSS="40.6:72.78";
l.FRU="43.05:74.4599";
l.TSE="51.01:71.4599";
l.ALA="43.35:77.03";
l.POS="10.58:-61.33";
l.TAB="11.13:-60.81";
l.MNI="33.58:-80.2";
l.AXA="18.2:-63.05";
l.SXM="18.03:-63.1";


l.EUX="17.48:-62.96";
l.CUR="12.18:-68.95";
l.BON="12.11:-68.26";
l.AUA="12.5:-70";
l.UVF="13.71:-60.95";
l.SLU="14.01:-60.98";
l.SKB="17.3:-62.71";
l.SJU="18.43:-66";
l.PSE="18:-66.55";
l.NRR="18.23:-65.63";
l.MAZ="18.25:-67.13";
l.SIG="18.45:-66.08";
l.FAJ="18.3:-65.65";
l.BQN="18.48:-67.11";
l.STX="17.7:-64.78";
l.STT="18.3299:-64.9599";
l.GND="12:-61.78";
l.PTP="16.25:-61.51";
l.SFG="18.0799:-63.03";
l.FDF="14.58:-61";
l.DOM="15.53:-61.3";
l.DCF="15.33:-61.38";
l.BGI="13.06:-59.48";
l.ANU="17.13:-61.78";
l.LTM="3.36:-59.78";
l.KAR="5.85:-60.6";
l.VDP="0.21:-65.98";
l.VLV="0.33:-70.58";
l.VLN="10.15:-67.91";
l.TUV="0.08:-62.08";
l.STB="0.96:-71.93";
l.SOM="0.93:-64.15";
l.SFD="7.86:-67.43";
l.SFH="10.26:-68.75";
l.STD="7.55:-72.03";
l.SVZ="7.85:-72.43";
l.PZO="0.28:-62.75";
l.PBL="10.46:-68.06";
l.PYH="5.61:-67.6";
l.MUN="0.73:-63.15";
l.CCS="10.6:-66.98";
l.PMV="10.9:-63.95";
l.MRD="0.56:-71.15";
l.MAR="10.55:-71.7099";
l.LFR="0.23:-72.26";
l.LSP="11.76:-70.15";
l.GUQ="0.01:-69.75";
l.GUI="10.56:-62.3";
l.CUM="10.45:-64.11";
l.CZE="11.4:-69.66";
l.CUP="10.65:-63.25";
l.CAJ="6.21:-62.85";
l.CBL="0.11:-63.53";
l.BRM="10.03:-69.35";
l.BNS="0.61:-70.2099";
l.BLA="10.1:-64.68";
l.AAO="0.41:-64.4599";
l.AGV="0.55:-69.23";
l.TAW="-31.73:-55.91";
l.STY="-31.43:-57.98";
l.RVY="-30.96:-55.46";
l.PDU="-32.35:-58.05";
l.PDP="-34.9:-54.91";
l.MVD="-34.83:-56.01";
l.MLZ="-32.33:-54.21";
l.CYR="-34.45:-57.76";
l.ATI="-30.4:-56.5";
l.MVD="-34.78:-56.25";
l.CUZ="-13.53:-71.93";
l.TYL="-4.56:-81.25";
l.PIU="-5.2:-80.6";
l.PEM="-12.6:-69.2099";
l.TCQ="-18.05:-70.26";
l.TPP="-6.5:-76.36";
l.PIO="-13.73:-76.2099";
l.TRU="-0.08:-79.1";
l.AQP="-16.3299:-71.56";
l.IQT="-3.78:-73.3";
l.CHH="-6.2:-77.85";
l.YMS="-5.88:-76.11";
l.TBP="-3.55:-80.36";
l.JUL="-15.46:-70.15";
l.JJI="-7.16:-76.7099";
l.LIM="-12.01:-77.1";
l.ATA="-0.33:-77.58";
l.ANS="-13.7:-73.35";
l.AYP="-13.15:-74.2";
l.CIX="-6.78:-79.81";
l.TGI="-0.28:-76";
l.CHM="-0.15:-78.51";
l.PCL="-0.36:-74.56";
l.CAY="4.81:-52.35";
l.ORG="5.8:-55.18";
l.PBM="5.45:-55.18";
l.VVI="-17.63:-63.13";
l.TDD="-14.81:-64.91";
l.TJA="-21.55:-64.7";
l.SRE="-19:-65.28";
l.SRJ="-14.85:-66.73";
l.RBQ="-14.41:-67.5";
l.RIB="-11:-66.06";
l.PSZ="-18.96:-57.81";
l.POI="-19.53:-65.7099";
l.MGD="-13.25:-64.05";
l.LPB="-16.5:-68.18";
l.SJB="-13.05:-64.65";
l.GYA="-10.81:-65.33";
l.CEP="-16.13:-62.01";
l.CIJ="-11.03:-68.76";
l.CBB="-17.41:-66.16";
l.CAM="-20:-63.51";
l.BJO="-22.76:-64.3";
l.APB="-14.73:-68.4";
l.VVC="4.16:-73.6";
l.VUP="10.43:-73.23";
l.ULQ="4.08:-76.23";
l.UIB="5.68:-76.63";
l.AUC="7.06:-70.73";
l.TRB="0.06:-76.73";
l.TME="6.45:-71.75";
l.TDA="5.41:-71.65";
l.SVI="2.15:-74.75";
l.ADZ="12.58:-81.7";
l.SMR="11.11:-74.2099";
l.SJE="2.56:-72.63";
l.RVE="6.95:-71.85";
l.RCH="11.51:-72.91";
l.MDE="6.15:-75.41";
l.PVA="13.35:-81.35";
l.PSO="1.3799:-77.28";
l.PPN="2.45:-76.6";
l.PEI="4.8:-75.73";
l.PCR="6.18:-67.48";
l.OTU="7:-74.7";
l.OCV="0.3:-73.35";
l.NVA="2.95:-75.28";
l.MZL="5.01:-75.45";
l.MVP="1.25:-70.23";
l.MTR="0.81:-75.81";
l.MGN="0.28:-74.83";
l.EOH="6.21:-75.58";
l.LET="-4.18:-69.93";
l.IPI="0.85:-77.66";
l.IBE="4.41:-75.11";
l.GPI="2.56:-77.88";
l.FLA="1.58:-75.55";
l.EJA="7.01:-73.8";
l.CZU="0.31:-75.28";
l.TCO="1.8:-78.73";
l.CLO="3.53:-76.36";
l.CTG="10.43:-75.5";
l.COG="5.0599:-76.66";
l.CUC="7.91:-72.5";
l.BUN="3.81:-76.98";
l.BSC="6.2:-77.38";
l.BAQ="10.88:-74.76";
l.BOG="4.7:-74.13";
l.BGA="7.11:-73.18";
l.PUU="0.5:-76.5";
l.AXM="4.45:-75.75";
l.ASU="-25.23:-57.51";
l.TUA="0.8:-77.7";
l.TPC="-0.11:-76.33";
l.SNC="-2.2:-80.98";
l.UIO="-0.13:-78.48";
l.PVO="-1.03:-80.4599";
l.MEC="-0.93:-80.66";
l.MCH="-3.2599:-79.95";
l.XMS="-2.28:-78.11";
l.LGQ="0.08:-76.86";
l.GYE="-2.15:-79.88";
l.GPS="-0.45:-90.25";
l.CUE="-2.88:-78.98";
l.OCC="-0.45:-76.98";
l.ATF="-1.2:-78.56";
l.ZAL="-39.63:-73.08";
l.WCH="-42.9099:-72.68";
l.ULC="-33.4799:-70.68";
l.PMC="-41.43:-73.08";
l.ZCO="-38.76:-72.63";
l.LSC="-29.9:-71.18";
l.ZOS="-40.6:-73.05";
l.IPC="-27.15:-109.41";
l.CCP="-36.76:-73.05";
l.CPO="-27.28:-70.4";
l.LSQ="-37.4:-72.41";
l.ANF="-23.43:-70.43";
l.SCL="-33.38:-70.78";
l.IQQ="-20.53:-70.16";
l.GXQ="-45.58:-72.1";
l.PUQ="-53:-70.85";
l.CJC="-22.48:-68.9";
l.CCH="-46.56:-71.68";
l.BBA="-45.9:-71.68";
l.ARI="-18.3299:-70.33";
l.WAP="-43.6:-71.8";
l.ZUD="-41.9:-73.78";
l.QPS="-21.98:-47.33";
l.VIX="-20.25:-40.28";
l.BVH="-12.68:-60.08";
l.VAG="-21.5799:-45.46";
l.UBA="-19.75:-47.95";
l.UDI="-18.86:-48.21";
l.URG="-29.76:-57.03";
l.PAV="-0.4:-38.25";
l.TUR="-3.78:-49.71";
l.TBT="-4.25:-69.93";
l.TFF="-3.36:-64.7099";
l.THE="-5.05:-42.81";
l.SSA="-12.9:-38.31";
l.SSZ="-23.91:-46.28";
l.SJP="-20.8:-49.4";
l.CGH="-23.61:-46.65";
l.STM="-29.7:-53.68";
l.SLZ="-2.58:-44.2299";
l.SJK="-23.21:-45.85";
l.STU="-22.91:-43.71";
l.RAO="-21.13:-47.76";
l.SDU="-22.9:-43.15";
l.RIG="-32.06:-52.15";
l.REC="-0.11:-34.9099";
l.RBR="-0.86:-67.88";
l.PVH="-0.7:-63.9";
l.PMG="-22.53:-55.7";
l.PNB="-10.71:-48.38";
l.PNZ="-0.35:-40.55";
l.PET="-31.71:-52.31";
l.PFB="-28.23:-52.31";
l.POO="-21.8299:-46.56";
l.POA="-29.98:-51.1599";
l.NAT="-5.9:-35.2299";
l.GEL="-28.26:-54.16";
l.NVT="-26.86:-48.65";
l.MCP="0.05:-51.06";
l.MCZ="-0.5:-35.78";
l.MOC="-16.7:-43.81";
l.MGF="-23.43:-51.9";
l.MAB="-5.36:-49.13";
l.LAZ="-13.25:-43.4";
l.LDB="-23.3299:-51.11";
l.LIP="-21.65:-49.71";
l.VCP="-23:-47.13";
l.JOI="-26.21:-48.78";
l.JPA="-7.26:-35.88";
l.JDF="-21.78:-43.38";
l.IMP="-5.51:-47.45";
l.IPN="-19.46:-42.4799";
l.IOS="-14.8:-39.01";
l.ATM="-3.25:-52.25";
l.GRU="-23.41:-46.46";
l.GYN="-16.61:-49.21";
l.GIG="-22.8:-43.2299";
l.FOR="-3.76:-38.51";
l.FEN="-3.85:-32.4099";
l.FLN="-27.66:-48.53";
l.IGU="-25.5799:-54.48";
l.FRC="-20.5799:-47.36";
l.MAO="-3.0299:-60.03";
l.PPB="-22.16:-51.4099";
l.CZS="-7.6:-72.76";
l.CGB="-15.65:-56.11";
l.CXJ="-29.18:-51.18";
l.CRQ="-17.65:-39.25";
l.CWB="-25.51:-49.1599";
l.CMG="-19:-57.66";
l.CAW="-21.68:-41.3";
l.CLN="-7.31:-47.45";
l.XAP="-27.13:-52.65";
l.CGR="-20.46:-54.66";
l.CNF="-19.63:-43.96";
l.CAC="-25:-53.5";
l.BVB="2.83:-60.68";
l.BAU="-22.3299:-49.05";
l.BSB="-15.85:-47.9";
l.BFH="-25.4:-49.21";
l.PLU="-19.85:-43.95";
l.BGX="-31.38:-54.1";
l.BEL="-1.3599:-48.46";
l.ARU="-21.13:-50.4099";
l.AFL="-0.85:-56.1";
l.AJU="-10.98:-37.06";
l.AQA="-21.8:-48.11";
l.CDJ="-0.33:-49.3";
l.CPC="-40.06:-71.13";
l.VLG="-37.2299:-57.01";
l.TDL="-37.2299:-59.21";
l.BRC="-41.15:-71.15";
l.RSA="-36.58:-64.26";
l.NQN="-38.93:-68.15";
l.MDQ="-37.93:-57.56";
l.BHI="-38.71:-62.16";
l.RZA="-50:-68.56";
l.RYO="-51.6:-72.2099";
l.JSM="-44.03:-70.45";
l.ULA="-49.3:-67.8";
l.USH="-54.83:-68.28";
l.RGL="-51.6:-69.3";
l.RGA="-53.76:-67.73";
l.PUD="-47.7299:-65.9";
l.ING="-50.33:-72.23";
l.PMY="-42.75:-65.1";
l.VDM="-40.86:-63";
l.REL="-43.2:-65.26";
l.EQS="-42.9:-71.13";
l.EMX="-42.01:-71.16";
l.CRD="-45.78:-67.45";
l.EHL="-41.93:-71.51";
l.ORA="-23.15:-64.31";
l.JUJ="-24.38:-65.08";
l.SLA="-24.85:-65.48";
l.PSS="-27.38:-55.96";
l.IGR="-25.73:-54.46";
l.FMA="-26.2:-58.21";
l.RES="-27.43:-59.05";
l.CNQ="-27.43:-58.75";
l.LUQ="-33.26:-66.35";
l.VDR="-31.93:-65.13";
l.RCU="-33.08:-64.25";
l.UAQ="-31.56:-68.41";
l.TUC="-26.83:-65.1";
l.IRJ="-29.36:-66.78";
l.SDE="-27.75:-64.3";
l.CTC="-28.58:-65.75";
l.AFA="-34.58:-68.4";
l.LGS="-35.4799:-69.56";
l.MDZ="-32.81:-68.78";
l.LPG="-34.96:-57.88";
l.COR="-31.31:-64.2";
l.AEP="-34.55:-58.4";
l.SFN="-31.7:-60.8";
l.ROS="-32.9:-60.78";
l.PRA="-31.78:-60.46";
l.GHU="-33:-58.6";
l.COC="-31.28:-57.98";
l.SJI="10.75:121.91";
l.PPS="0.73:118.75";
l.NOP="10.3:123.96";
l.KLO="11.66:122.36";
l.ILO="10.7:122.53";
l.DGT="0.33:123.3";
l.BCD="10.63:122.91";
l.TAC="11.21:125.01";
l.BAG="16.36:120.61";
l.ZAM="6.91:122.05";
l.LGP="7.81:123.45";
l.MNL="7.61:124.05";
l.CGY="0.4:124.6";
l.CEB="7.15:124.2";
l.MNL="14.5:121.01";
l.OGN="24.46:122.96";
l.RNJ="27.03:128.4";
l.SHI="24.81:125.13";
l.KTD="25.93:131.31";
l.MMY="24.76:125.28";
l.MMD="25.8299:131.25";
l.UEO="26.35:126.7";
l.ISG="24.3299:124.18";
l.DNA="26.35:127.76";
l.OKA="26.18:127.63";
l.YEC="36.61:128.35";
l.TAE="35.88:128.65";
l.KPO="35.9799:129.41";
l.GMP="37.55:126.78";
l.OSN="37.08:127.01";
l.SSN="37.43:127.1";
l.USN="35.58:129.35";
l.PUS="35.1599:128.93";
l.CJU="33.5:126.48";
l.KAG="37.75:128.93";
l.SHO="38.13:128.6";
l.RSU="34.83:127.6";
l.KUB="35.9:126.6";
l.KWJ="35.11:126.8";
l.OKO="35.7299:139.33";
l.HND="35.55:139.76";
l.MMY="34.06:139.55";
l.OIM="34.78:139.35";
l.HAC="33.1:139.78";
l.SDJ="38.13:140.91";
l.MSJ="40.7:141.36";
l.AXT="39.6:140.21";
l.HNA="39.4099:141.13";
l.GAJ="38.4:140.36";
l.AOJ="40.7299:140.68";
l.TAK="34.2:134";
l.TKS="34.11:134.6";
l.TTJ="35.51:134.15";
l.ITM="34.78:135.43";
l.MYJ="33.81:132.68";
l.KCZ="33.53:133.66";
l.YGJ="35.4799:133.23";
l.IZO="35.4:132.88";
l.OKJ="34.75:133.85";
l.HIJ="34.43:132.91";
l.TOY="36.63:137.18";
l.OKI="36.1599:133.31";
l.NGO="35.25:136.91";
l.KMQ="36.38:136.4";
l.TKN="27.83:128.86";
l.ASJ="28.41:129.7";
l.NGS="32.9099:129.91";
l.KMJ="32.83:130.85";
l.KKJ="33.83:130.93";
l.OIT="33.46:131.73";
l.KMI="31.86:131.43";

l.KOJ="31.8:130.71";
l.TNE="30.53:130.95";
l.FUK="33.58:130.45";
l.FUJ="32.65:128.81";
l.KUM="30.38:130.65";
l.RIS="45.2299:141.18";
l.AKJ="43.6599:142.43";
l.MBE="44.3:143.4";
l.TSJ="34.28:129.31";
l.UBJ="33.9099:131.26";
l.IKI="33.7299:129.78";
l.WKJ="45.4:141.8";
l.SPK="43.1:141.36";
l.SHB="43.56:144.95";
l.MMB="43.86:144.15";
l.SPK="42.78:141.65";
l.HKD="41.76:140.81";
l.CTS="42.76:141.68";
l.OBO="42.7299:143.21";
l.SHM="33.65:135.35";
l.IWO="24.78:141.31";
l.MMJ="36.1599:137.91";
l.NRT="35.75:140.38";
l.HUN="24.01:121.61";
l.WOT="23.36:119.48";
l.TPE="25.06:121.21";
l.TSA="25.06:121.55";
l.MZG="23.56:119.61";
l.TNN="22.95:120.2";
l.MZW="26.21:120";
l.KYD="22.01:121.51";
l.TXG="24.18:120.65";
l.CYI="23.45:120.38";
l.KHH="22.56:120.35";
l.GNI="22.66:121.45";
l.TTT="22.75:121.08";
l.PIF="22.66:120.45";
l.KNH="24.41:118.35";
l.YAP="0.48:138.06";
l.KSA="5.35:162.95";
l.ROR="7.36:134.53";
l.PNI="6.98:158.2";
l.TKK="7.45:151.83";
l.PIZ="69.7099:-163";
l.OLI="70.48:-149.86";
l.MDY="28.2:-177.36";
l.CXI="1.98:-157.33";
l.KWA="0.71:167.71";
l.MAJ="7.05:171.26";

l.JON="16.71:-169.53";
l.UPP="20.25:-155.85";
l.ITO="19.71:-155.03";
l.BSF="19.75:-155.55";
l.OGG="20.88:-156.41";

l.LNY="20.78:-156.95";
l.HNL="21.3:-157.91";
l.NGF="21.43:-157.76";
l.MUE="20:-155.66";
l.MKK="21.15:-157.08";
l.LIH="21.96:-159.33";
l.KOA="19.73:-156.03";
l.JHM="20.95:-156.66";
l.HNM="20.78:-156";
l.HDH="21.56:-158.2";
l.BKH="22.01:-159.78";
l.TNI="14.98:145.61";
l.GUM="13.48:144.78";
l.UAM="13.58:144.91";
l.SPN="15.11:145.71";
l.ROP="14.16:145.23";
l.FYU="66.56:-145.25";
l.YAK="59.5:-139.65";
l.AIN="70.6:-159.85";
l.VDZ="61.13:-146.23";
l.UNK="63.88:-160.78";
l.TLJ="62.88:-155.96";
l.TKA="62.31:-150.08";
l.TNC="65.55:-167.91";
l.TAL="65.16:-152.1";
l.SYA="52.7:174.1";
l.SVW="61.08:-155.56";
l.SNP="57.16:-170.21";
l.SIT="57.03:-135.35";
l.SCC="70.18:-148.45";
l.PML="59:-161.81";
l.OTZ="66.88:-162.58";
l.ORT="62.95:-141.91";
l.OME="64.5:-165.43";
l.ANN="55.03:-131.56";
l.MRI="61.2:-149.83";
l.MCG="62.95:-155.6";
l.LUR="68.86:-166.1";
l.KTN="55.35:-131.7";
l.AKN="58.66:-156.63";
l.JNU="58.35:-134.56";
l.UTO="65.98:-153.7";
l.ILI="59.75:-154.9";
l.HOM="59.63:-151.46";
l.SGY="59.45:-135.3";
l.GKN="62.15:-145.45";
l.GAL="64.73:-156.93";
l.FBK="64.83:-147.6";
l.FAI="64.8:-147.85";
l.ENA="60.56:-151.23";
l.EIL="64.65:-147.1";
l.EHM="58.63:-162.05";
l.EDF="61.25:-149.8";
l.DUT="53.9:-166.53";
l.ADQ="57.75:-152.48";
l.DLG="59.03:-158.5";
l.ADK="51.86:-176.63";
l.CDV="60.48:-145.46";
l.CDB="55.2:-162.71";
l.BTT="66.9:-151.51";
l.BRW="71.28:-156.75";
l.BIG="63.98:-145.71";
l.BET="60.76:-161.83";
l.BTI="70.13:-143.56";
l.PAQ="61.58:-149.08";
l.DOH="25.25:51.55";
l.PMS="34.55:38.31";
l.LTK="35.4:35.93";
l.DEZ="35.28:40.1599";

l.DAM="33.4:36.5";
l.ALP="36.1599:37.21";
l.BSR="30.53:47.65";
l.SDA="33.25:44.2299";
l.PZH="31.35:69.45";
l.TRB="25.98:63.01";
l.BDN="24.8299:68.83";
l.SUL="28.63:69.16";
l.SDT="34.8:72.35";
l.SKZ="27.71:68.78";
l.RAZ="33.83:73.78";
l.ISB="33.6:73.08";
l.RYK="28.38:70.26";
l.UET="30.25:66.93";
l.PEW="33.9799:71.5";
l.PSI="25.28:63.31";
l.PJG="26.95:64.11";
l.ORW="25.26:64.58";
l.WNS="26.21:68.38";
l.MUX="30.2:71.41";
l.MJD="27.33:68.13";
l.MFG="34.33:73.5";
l.LHE="31.51:74.4";
l.HDD="25.31:68.35";
l.KHI="24.9:67.15";
l.GIL="35.9099:74.33";
l.GWD="25.21:62.31";
l.LYP="31.35:72.98";
l.TTH="17.65:54.01";
l.SLL="17.03:54.08";
l.MCT="23.5799:58.28";
l.MSH="20.66:58.88";
l.KHS="26.16:56.23";
l.SHJ="25.31:55.51";
l.RKT="25.6:55.93";
l.FJR="25.1:56.31";
l.DXB="25.25:55.35";
l.AZI="24.41:54.45";
l.AUH="24.41:54.65";
l.BEY="33.8:35.4799";
l.KWI="29.21:47.96";
l.OMF="32.35:36.25";
l.AQJ="29.6:35.01";
l.ADJ="31.96:35.9799";
l.AMM="31.71:35.9799";
l.ZAH="29.46:60.9";
l.ZBR="25.43:60.36";
l.AZD="31.9:54.26";
l.TBZ="38.11:46.2299";
l.SYZ="29.53:52.58";
l.RZR="36.9:50.6599";
l.XBJ="32.88:59.26";
l.KER="30.25:56.95";
l.BND="27.21:56.36";
l.THR="35.68:51.3";
l.RAS="37.31:49.6";
l.SDG="35.2299:47";
l.KSH="34.33:47.15";
l.BDH="26.51:54.81";
l.KIH="26.51:53.96";
l.BUZ="28.93:50.83";
l.AWZ="31.33:48.75";
l.MRX="30.55:49.15";
l.QMJ="32:49.26";
l.ABD="30.35:48.21";
l.YNB="24.13:38.05";
l.EJH="26.18:36.46";
l.TUI="31.68:38.71";
l.TIF="21.48:40.53";
l.TUU="28.35:36.61";
l.SLF="20.45:45.61";
l.AJO="29.78:40.1";
l.SHW="17.46:47.11";
l.RAE="30.9:41.13";
l.RUH="24.95:46.68";
l.RAH="29.61:43.4799";
l.AQI="28.33:46.11";
l.EAM="17.6:44.4099";
l.MED="24.55:39.7";
l.HBT="27.9:45.51";
l.JED="21.66:39.15";
l.HAS="27.43:41.68";
l.URY="31.4:37.26";
l.ELQ="26.3:43.76";
l.GIZ="16.9:42.58";
l.DHA="26.25:50.15";
l.DMM="26.46:49.78";
l.BHH="19.98:42.61";
l.ABT="20.28:41.63";
l.LEA="25.28:49.4799";
l.AHB="18.23:42.65";
l.BAH="26.26:50.63";
l.UND="36.65:68.9";
l.MZR="36.7:67.2";
l.MMZ="35.93:64.75";
l.KDH="31.5:65.83";
l.KBL="34.55:69.2";
l.JAA="34.38:70.48";
l.HEA="34.2:62.21";
l.WAG="-39.95:175.01";
l.WSZ="-41.7299:171.56";
l.WRE="-35.76:174.35";
l.WLG="-41.31:174.8";
l.WHK="-37.9099:176.9";
l.WKA="-44.71:169.23";
l.BHE="-41.51:173.86";
l.TIU="-44.3:171.21";
l.TRG="-37.6599:176.18";
l.ROT="-38.1:176.31";
l.ZQN="-45.01:168.73";
l.PPQ="-40.9:174.98";
l.PMR="-40.31:175.61";
l.OAM="-44.96:171.06";
l.IVC="-46.4:168.3";
l.NSN="-41.28:173.21";
l.NPL="-39:174.16";
l.MRO="-40.96:175.63";
l.TEU="-45.51:167.65";
l.GTN="-43.75:170.13";
l.ALR="-45.2:169.36";
l.KAT="-35.06:173.28";
l.KKE="-35.25:173.9";
l.HLZ="-37.85:175.31";
l.HKK="-42.7:170.98";
l.MON="-43.9:170.11";
l.GIS="-38.65:177.96";
l.DUD="-45.9099:170.18";
l.CHT="-43.8:-176.45";
l.CHC="-43.4799:172.51";
l.TUO="-38.7299:176.08";
l.AKL="-37:174.78";
l.NOU="-22:166.2";
l.UVE="-20.63:166.56";
l.TOU="-20.78:165.25";
l.MEE="-21.46:168.03";
l.GEA="-22.25:166.46";
l.LIF="-20.76:167.23";
l.KOC="-20.53:164.25";
l.KNQ="-21.05:164.83";
l.VLI="-17.68:168.31";
l.RFP="-16.71:-151.45";
l.MAU="-16.41:-152.23";
l.HOI="-18.06:-140.93";


l.MOZ="-17.48:-149.75";
l.HUH="-16.68:-151.01";
l.RGI="-14.95:-147.65";
l.BOB="-16.43:-151.75";
l.NHV="-0.78:-140.21";
l.TKX="-14.45:-145.01";
l.MVT="-14.86:-148.71";
l.AXR="-15.23:-146.6";
l.TKP="-14.7:-145.25";
l.PKP="-14.8:-138.8";
l.NAU="-14.16:-141.26";
l.MKP="-16.5799:-143.65";
l.KKR="-15.65:-146.88";
l.GMR="-23.06:-134.88";
l.XMH="-14.43:-146.06";
l.FAV="-16.05:-145.65";
l.REA="-18.45:-136.43";
l.TIH="-15.11:-148.21";
l.AAA="-17.35:-145.5";
l.TUB="-23.35:-149.51";
l.RUR="-22.43:-151.35";
l.PPG="-14.31:-170.7";
l.APW="-13.81:-172";
l.WLS="-13.23:-176.18";
l.HUE="-19.06:-169.91";
l.TBF="-1.21:174.76";
l.TRW="1.3599:173.13";
l.FUN="-0.51:179.21";
l.VAV="-18.5799:-173.95";
l.HPA="-19.76:-174.33";
l.TBU="-21.23:-175.15";
l.LMG="-16.46:179.33";
l.SUV="-18.03:178.55";
l.NAN="-17.75:177.43";
l.RAR="-21.2:-159.8";
l.AIT="-18.81:-159.76";
l.BZE="17.53:-88.3";
l.ZSA="24.05:-74.51";
l.NAS="25.03:-77.45";
l.MYG="22.36:-73";
l.SML="23.56:-75.26";
l.LGI="23.16:-75.08";
l.IGA="20.96:-73.66";
l.WTD="26.68:-78.9599";
l.FPO="26.55:-78.68";
l.RSD="24.88:-76.16";
l.GHB="25.28:-76.31";
l.ELH="25.46:-76.66";
l.GGT="23.55:-75.86";
l.BIM="25.68:-79.25";
l.CCZ="25.41:-77.86";
l.TCB="26.73:-77.38";
l.AXP="22.43:-73.9599";
l.SAQ="25.05:-78.03";
l.MHH="26.5:-77.08";
l.ASD="24.68:-77.78";
l.GCM="19.28:-81.35";
l.CYB="19.68:-79.86";
l.VTU="20.98:-76.93";
l.VRA="23.03:-81.43";
l.SNU="22.48:-79.93";
l.GER="21.8299:-82.78";
l.MZO="20.28:-77.08";
l.MOA="20.65:-74.91";
l.LCL="22.3299:-83.63";
l.HOG="20.78:-76.3";
l.HAV="22.98:-82.4";
l.GAO="20.0799:-75.15";
l.SCU="19.96:-75.83";
l.CMW="21.41:-77.83";
l.CYO="21.6:-81.53";
l.CFG="22.15:-80.4";
l.AVI="22.01:-78.78";
l.BYM="20.38:-76.61";
l.BCA="20.35:-74.5";
l.PAP="18.56:-72.28";
l.CAP="19.71:-72.18";
l.SAL="13.43:-89.05";
l.XQP="0.43:-84.11";
l.PMZ="0.95:-83.4599";
l.SJO="0.98:-84.2";
l.NOB="0.96:-85.65";
l.LIO="0.95:-83.01";
l.LIR="10.58:-85.53";
l.GLF="0.65:-83.16";
l.OTR="0.6:-82.9599";
l.PTY="0.06:-79.38";
l.PAC="0.96:-79.55";
l.HOW="0.9:-79.58";
l.DAV="0.38:-82.43";
l.CHX="0.45:-82.51";
l.BOC="0.33:-82.25";
l.PUZ="14.03:-83.38";
l.MGA="12.13:-86.16";
l.BEF="11.98:-83.76";
l.ZLO="19.13:-104.55";
l.ZMM="20.03:-102.26";
l.ZIH="17.6:-101.45";
l.ZCL="22.88:-102.68";
l.VER="19.13:-96.18";
l.VSA="17.98:-92.81";
l.CUN="21.03:-86.86";
l.TAP="14.78:-92.36";
l.TLC="19.3299:-99.55";
l.TSL="22.03:-98.8";
l.TAM="22.28:-97.85";
l.TIJ="32.53:-116.96";
l.TGZ="16.76:-93.33";
l.TRC="25.56:-103.4";
l.TXA="19.53:-98.16";
l.SLP="22.25:-100.91";
l.SJD="23.15:-109.71";
l.REX="26:-98.2099";
l.QRO="20.61:-100.36";
l.PXM="15.86:-97.08";
l.PVR="20.66:-105.25";
l.UPN="19.38:-102.03";
l.PDS="28.61:-100.53";
l.PPE="31.35:-113.51";
l.PCA="20.06:-98.76";
l.PBC="19.15:-98.36";
l.PAZ="20.6:-97.45";
l.OAX="16.98:-96.7099";
l.NLD="27.43:-99.56";
l.NOG="31.21:-110.96";
l.MZT="23.15:-106.25";
l.MTY="25.76:-100.1";
l.MEX="19.43:-99.06";
l.LOV="26.95:-101.4599";
l.MTT="18.1:-94.56";
l.MLM="19.8299:-101.01";
l.MXL="32.61:-115.23";
l.MID="20.93:-89.65";
l.MAM="25.76:-97.51";
l.LTO="25.98:-111.33";
l.LAP="24.06:-110.35";
l.BJX="20.98:-101.4599";
l.LMM="25.68:-109.06";
l.LZC="18:-102.2099";
l.SLW="25.53:-100.91";
l.ISJ="21.23:-86.73";
l.CLQ="19.26:-103.56";
l.HMO="29.08:-111.03";
l.TCN="18.48:-97.41";
l.GYM="27.96:-110.91";
l.GDL="20.51:-103.3";
l.ESE="31.78:-116.6";
l.TPQ="21.41:-104.83";
l.DGO="24.11:-104.51";
l.MMC="22.73:-99.01";
l.CZM="20.51:-86.91";
l.CVM="23.7:-98.95";
l.CUU="28.7:-105.95";
l.CJS="31.63:-106.41";
l.CPE="19.81:-90.5";
l.CEN="27.38:-109.81";
l.CTM="18.5:-88.31";
l.CUL="24.75:-107.46";
l.CME="18.65:-91.78";
l.CVJ="18.8299:-99.25";
l.HUX="15.76:-96.25";
l.AGU="21.7:-102.31";
l.NTR="25.85:-100.23";
l.ACA="16.75:-99.75";
l.KTP="17.98:-76.81";
l.POT="18.18:-76.53";
l.MBJ="18.5:-77.9";
l.KIN="17.93:-76.78";
l.OCJ="18.4:-76.9599";
l.TGU="14.05:-87.2099";
l.TEA="15.76:-87.4599";
l.RTB="16.31:-86.51";
l.PEU="15.25:-83.76";
l.GJA="16.43:-85.9";
l.SAP="15.45:-87.91";
l.LCE="15.73:-86.85";
l.GUA="14.56:-90.51";
l.CBV="15.46:-90.4";
l.STI="19.4:-70.6";
l.SDQ="18.41:-69.66";
l.POP="19.75:-70.56";
l.PUJ="18.56:-68.35";
l.LRM="18.45:-68.9";
l.HEX="18.46:-69.9599";
l.BRX="18.25:-71.11";
l.XSC="21.5:-71.51";
l.PLS="21.76:-72.25";
l.NCA="21.91:-71.93";
l.TAT="49.06:20.23";
l.SLD="48.63:19.13";
l.PZY="48.61:17.81";

l.KSC="48.65:21.23";
l.BTS="48.1599:17.2";
l.TIV="42.4:18.71";
l.PRN="42.56:21.03";
l.TGD="42.35:19.25";
l.BEG="44.81:20.3";
l.GIB="36.15:-5.33";
l.SKP="41.95:21.61";
l.OHD="41.1599:20.73";
l.BAL="37.9099:41.1";
l.VAN="38.46:43.31";
l.TZX="40.9799:39.78";
l.ERZ="39.95:41.1599";
l.ERC="39.7:39.51";
l.DIY="37.88:40.2";
l.EZS="38.6:39.28";
l.DLM="36.7:28.78";
l.IGL="38.5:27";
l.ADB="38.28:27.15";
l.ESK="39.78:30.56";
l.BDM="40.31:27.96";
l.BZI="39.61:27.91";
l.BTZ="40.21:29";
l.IST="40.96:28.81";
l.DNZ="37.78:29.7";
l.ASR="38.76:35.4799";
l.MLX="38.43:38.08";
l.VAS="39.8:36.9";
l.SSX="41.26:36.3";
l.MZH="40.81:35.51";
l.KYA="37.96:32.55";
l.GZT="36.93:37.46";
l.AYT="36.9:30.78";
l.AFY="38.71:30.6";
l.ADA="37:35.4099";
l.ADA="36.96:35.26";
l.ANK="39.93:32.68";
l.ESB="40.11:32.9799";
l.SMV="46.51:0.86";
l.ACH="47.4799:0.55";
l.ZRH="47.45:0.53";
l.BRN="46.9:7.48";
l.LUG="46:0.9";
l.SIR="46.21:7.31";
l.GVA="46.2299:6.1";
l.TSR="45.8:21.3299";
l.TGM="46.46:24.4";
l.TCE="45.05:28.7";
l.SCV="47.68:26.35";
l.SUJ="47.7:22.88";
l.SBZ="45.78:24.0799";
l.OTP="44.56:26.1";
l.OMR="47.01:21.9";
l.IAS="47.1599:27.61";
l.CRA="44.31:23.88";

//okay
l.CSB="45.4099:22.25";
l.CLJ="46.78:23.68";
l.CND="44.35:28.48";
l.BBU="44.5:26.1";
l.BAY="47.65:23.46";
l.BCM="46.51:26.9";
l.ARW="46.1599:21.25";
l.SJJ="43.81:18.31";
l.OMO="43.26:17.8299";
l.VRL="41.26:-7.71";
l.SJZ="38.65:-28.16";
l.LIS="38.76:-0.13";
l.PXO="33.06:-16.3299";
l.OPO="41.2299:-0.66";
l.PIX="38.55:-28.43";
l.PDL="37.7299:-25.68";
l.TER="38.75:-27.08";
l.HOR="38.51:-28.7";
l.GRW="39.08:-28.01";
l.FAO="37:-7.95";
l.FLW="39.45:-31.11";
l.BGC="41.86:-6.7";
l.SMA="36.96:-25.16";
l.VIE="48.1:16.56";
l.SZG="47.78:13";
l.LNZ="48.2299:14.18";
l.KLU="46.65:14.33";
l.INN="47.25:11.33";
l.MLA="35.85:14.46";
l.SDV="32.1:34.76";
l.VDA="29.93:34.93";
l.RPN="32.96:35.56";
l.HFA="32.8:35.03";
l.ETH="29.55:34.95";
l.BEV="31.28:34.71";
l.TLV="32:34.86";
l.BRQ="49.15:16.68";
l.PRG="50.1:14.25";
l.PRV="49.4099:17.4";
l.PED="50:15.73";
l.OSR="49.68:18.1";
l.KLV="50.2:12.9";
l.POW="45.46:13.6";
l.MBX="46.46:15.68";
l.LJU="46.21:14.45";
l.PEG="43.08:12.5";
l.GRS="42.75:11.06";
l.FLR="43.8:11.2";
l.PSA="43.68:10.38";
l.NAP="40.88:14.28";
l.QLT="41.53:12.9";
l.EBA="42.75:10.23";
l.FCO="41.8:12.25";
l.CIA="41.78:12.58";
l.SAY="43.25:11.25";
l.VCE="45.5:12.35";
l.VRN="45.38:10.88";
l.QPA="45.38:11.83";
l.VIC="45.56:11.51";
l.RMI="44.01:12.6";
l.TRS="45.81:13.45";
l.VBS="45.4099:10.31";
l.FRL="44.18:12.06";
l.TSF="45.63:12.18";
l.BLQ="44.53:11.28";
l.BZO="46.45:11.31";
l.AVB="46.01:12.58";
l.CUF="44.53:7.61";
l.QPZ="44.9:0.71";
l.PMF="44.81:10.28";
l.LIN="45.43:0.26";
l.GOA="44.4:0.83";
l.ALL="44.05:0.11";
l.TRN="45.2:7.63";

l.BGY="45.6599:0.7";
l.MXP="45.61:0.71";
l.TTB="39.9099:0.66";
l.OLB="40.88:0.51";
l.CAG="39.25:0.05";
l.DCI="39.35:0.96";
l.AHO="40.61:0.28";
l.NSY="37.4:14.91";
l.TPS="37.9:12.48";
l.REG="38.06:15.65";
l.PMO="38.1:13.3";
l.PMO="38.1599:13.08";
l.PNL="36.8:11.96";
l.LMP="35.4799:12.61";
l.CTA="37.46:15.05";
l.SUF="38.9:16.23";
l.BDS="40.65:17.93";
l.PSR="42.4099:14.16";
l.LCC="40.2299:18.11";
l.TAR="40.5:17.4";
l.FOG="41.4099:15.53";
l.BRI="41.13:16.75";
l.CRV="38.9799:17.06";
l.DEB="47.4799:21.6";
l.BUD="47.43:19.25";
l.ZTH="37.75:20.86";
l.SKG="40.51:22.96";
l.SKU="38.96:24.48";
l.JSH="35.2:26.0799";
l.JTR="36.4:25.46";
l.SMI="37.68:26.9";
l.JSI="39.1599:23.5";
l.CHQ="35.51:24.13";
l.GPA="38.15:21.41";
l.RHO="36.4:28.08";
l.PVK="38.9099:20.75";
l.MJT="39.05:26.58";
l.JMK="37.43:25.3299";
l.LRA="39.65:22.45";
l.LXS="39.9099:25.23";
l.LRS="37.18:26.8";
l.KZI="40.28:21.8299";
l.KVA="40.9:24.61";
l.KSJ="35.4099:26.9";
l.AOK="35.4099:27.13";
l.KGS="36.78:27.08";
l.KLX="37.06:22.01";
l.EFL="38.11:20.5";
l.KIT="36.26:23.01";
l.KSO="40.43:21.26";
l.HER="35.33:25.16";
l.IOA="39.68:20.81";
l.JKH="38.33:26.13";
l.VOL="39.21:22.78";
l.HEW="37.88:23.71";
l.AXD="40.85:25.95";
l.AGQ="38.6:21.35";
l.PYR="37.9099:21.28";
l.FSP="46.75:-56.16";
l.FNI="43.75:4.4";
l.TLN="43.08:6.13";
l.SXB="48.53:7.61";
l.RHE="49.3:4.05";
l.ENC="48.68:6.21";
l.EPL="48.31:6.0599";
l.MZM="49.06:6.11";
l.DIJ="47.26:5.08";
l.MLH="47.58:7.51";
l.SNR="47.3:-2.13";
l.VNE="47.71:-2.71";
l.MXN="48.6:-3.8";
l.SBK="48.53:-2.85";
l.NTE="47.15:-1.6";
l.UIP="47.96:-4.16";
l.LAI="48.75:-3.46";
l.RNS="48.06:-1.73";
l.LME="47.93:0.2";
l.CFR="49.1599:-0.45";
l.EDM="46.7:-1.3599";
l.LRT="47.75:-3.43";
l.DOL="49.35:0.15";
l.DNR="48.58:-2.06";
l.CER="49.65:-1.46";
l.BES="48.43:-4.41";
l.LIL="50.55:3.08";
l.NVS="47:3.1";
l.QYR="48.31:4.01";
l.POX="49.08:2.0299";
l.ORY="48.71:2.35";
l.TNF="48.75:2.1";
l.CDG="49:2.55";
l.CSF="49.25:2.5099";
l.LBG="48.96:2.43";
l.LVA="48.01:-0.73";
l.CET="47.06:-0.86";
l.TUF="47.4099:0.71";
l.URO="49.38:1.16";
l.ORE="47.9799:1.75";
l.LEH="49.53:0.08";
l.BVA="49.45:2.1";
l.MEN="44.5:3.51";
l.AVN="43.9:4.9";
l.BZR="43.31:3.35";
l.MPL="43.56:3.95";
l.CTT="43.25:5.78";
l.PGF="42.7299:2.86";
l.NCE="43.65:7.21";
l.MRS="43.43:5.2";
l.CCF="43.2:2.3";
l.EBU="45.53:4.28";
l.CEQ="43.53:6.95";
l.QXB="43.5:5.36";
l.LYN="45.71:4.93";
l.CHR="46.85:1.71";
l.AUR="44.88:2.41";
l.VHY="46.1599:3.4";
l.VAF="44.9099:4.96";
l.MCU="46.35:2.56";
l.GNB="45.35:5.3099";
l.NCY="45.9099:6.08";
l.RNE="46.05:4";
l.QNX="46.28:4.78";
l.LYS="45.71:5.08";
l.QNJ="46.18:6.26";
l.XCD="46.81:4.81";
l.BOU="47.05:2.36";
l.CFE="45.78:3.16";
l.CMF="45.63:5.86";
l.AUF="47.85:3.48";
l.SOZ="41.9099:0.4";
l.AJA="41.9099:0.8";
l.FSC="41.5:0.08";
l.CLY="42.51:0.78";
l.BIA="42.55:0.48";
l.ETZ="48.96:6.25";
l.XMU="46.53:3.41";
l.XVF="45.9:4.63";
l.XBK="46.2:5.28";
l.LPY="45.06:3.75";
l.OBS="44.53:4.36";
l.DLE="47.03:5.41";
l.CMR="48.1:7.35";
l.RCO="45.88:-0.96";
l.RYN="45.61:-0.96";
l.RDZ="44.4:2.46";
l.DCM="43.55:2.28";
l.LBI="43.9:2.1";
l.XAC="44.58:-1.1";
l.BIQ="43.46:-1.51";
l.PGX="45.18:0.8";
l.BVE="45.15:1.46";
l.ANG="45.71:0.21";
l.LRH="43.43:1.25";
l.PUF="43.36:-0.41";
l.TLS="43.61:1.35";
l.NIT="46.3:-0.4";
l.LIG="45.85:1.16";
l.MCU="46.21:2.35";
l.PIS="46.58:0.3";
l.CNG="45.65:-0.31";
l.EGC="44.81:0.51";
l.BOD="44.81:-0.7";
l.AGF="44.1599:0.58";
l.LTQ="50.5:1.6099";
l.CQF="50.95:1.95";
l.SVQ="37.4099:-5.88";
l.ZAZ="41.65:-1.03";
l.SDR="43.4099:-3.81";
l.VGO="42.21:-0.61";
l.VIT="42.86:-2.71";
l.VLL="41.7:-4.85";
l.VLC="39.4799:-0.46";
l.TOJ="40.4799:-3.45";
l.LEU="42.33:1.4";
l.SCQ="42.88:-0.4";
l.EAS="43.35:-1.78";
l.SLM="40.95:-5.5";
l.REU="41.13:1.16";
l.PNA="42.76:-1.6299";
l.PMI="39.55:2.73";
l.OZP="37.1599:-5.6";
l.MAH="39.85:4.21";
l.AGP="36.6599:-4.48";
l.MAD="40.46:-3.55";
l.MJV="37.76:-0.8";
l.XRY="36.7299:-6.05";
l.IBZ="38.86:1.3599";
l.GRX="37.18:-3.76";
l.GRO="41.9:2.75";
l.GRX="37.11:-3.63";
l.LCG="43.3:-0.36";
l.BJZ="38.88:-6.81";
l.BCN="41.28:2.06";
l.BIO="43.3:-2.9";
l.ODB="37.83:-4.83";
l.OVD="43.55:-6.03";

l.LEI="36.83:-2.36";
l.ALC="38.26:-0.55";
l.ZAD="44.1:15.33";
l.ZAG="45.7299:16.06";
l.SPU="43.53:16.28";
l.RJK="45.21:14.56";
l.PUY="44.88:13.91";
l.OSI="45.45:18.8";
l.DBV="42.55:18.26";
l.AKT="34.58:32.9799";
l.PFO="34.71:32.4799";
l.LCA="34.86:33.61";
l.VAR="43.21:27.81";
l.SOF="42.68:23.4";
l.PDV="42.06:24.85";
l.GOZ="43.15:25.7";
l.BOJ="42.56:27.5";
l.TIA="41.4:19.71";
l.ZUN="35.08:-108.78";
l.YUM="32.65:-114.6";
l.YNG="41.25:-80.66";
l.YIP="42.2299:-83.51";
l.WWD="39:-74.9";
l.WSD="32.33:-106.4";
l.WRI="40:-74.58";
l.WRB="32.63:-83.58";
l.WAL="37.93:-75.45";
l.VRB="27.65:-80.41";
l.VPS="30.46:-86.51";
l.VCV="34.58:-117.36";
l.VBG="34.71:-120.56";
l.VAD="30.96:-83.18";
l.UGN="42.4099:-87.86";
l.TYS="35.8:-83.98";
l.TYR="32.35:-95.4";
l.TXK="33.45:-93.98";
l.TUS="32.1:-110.93";
l.TUL="36.18:-95.88";
l.TTN="40.26:-74.8";
l.TPA="27.96:-82.51";
l.TNT="25.85:-80.88";
l.TMB="25.63:-80.41";
l.TLH="30.38:-84.35";
l.TIK="35.4:-97.38";
l.TEB="40.83:-74.05";
l.TCS="33.2299:-107.26";
l.TCM="47.13:-122.46";
l.TCC="35.1599:-103.6";
l.TBN="37.7299:-92.13";
l.SZL="38.71:-93.53";
l.SYR="43.1:-76.1";
l.SWF="41.5:-74.1";
l.SVN="32:-81.13";
l.SUX="42.4:-96.38";
l.SUU="38.25:-121.91";
l.STL="38.7299:-90.35";
l.SSC="33.96:-80.4599";
l.SPS="33.9799:-98.48";
l.SPG="27.75:-82.61";
l.SPB="45.76:-122.85";
l.SNA="33.6599:-117.86";
l.SMF="38.68:-121.58";
l.SLC="40.78:-111.96";
l.SKY="41.43:-82.65";
l.SKF="29.38:-98.56";
l.SKA="47.6:-117.65";
l.SJT="31.35:-100.48";
l.SJC="37.35:-121.91";
l.SHV="32.43:-93.81";
l.SFZ="41.9099:-71.48";
l.SFO="37.61:-122.36";
l.SFF="47.6599:-117.31";
l.SEM="32.33:-86.98";
l.SEA="47.43:-122.3";
l.SCK="37.88:-121.23";
l.SBY="38.33:-75.5";
l.SBO="32.6:-82.36";
l.SAV="32.11:-81.2";
l.SAT="29.53:-98.4599";
l.SAN="32.7299:-117.18";
l.SAF="35.61:-106.08";
l.SAC="38.5:-121.48";
l.RSW="26.53:-81.75";
l.ROW="33.3:-104.51";
l.ROC="43.11:-77.66";
l.RNO="39.4799:-119.76";
l.RND="29.51:-98.26";
l.RME="43.2299:-75.4";
l.RIV="33.86:-117.25";
l.RIU="38.4799:-121.1";
l.RIC="37.5:-77.31";
l.RDU="35.86:-78.78";
l.RDR="47.95:-97.4";
l.RCA="44.13:-103.1";
l.RBM="34.85:-92.3";
l.RAL="33.95:-117.43";
l.PWM="43.63:-70.3";
l.PVD="41.71:-71.41";
l.PUB="38.28:-104.48";
l.PSX="28.71:-96.25";
l.PSP="33.81:-116.5";
l.PRC="34.65:-112.41";
l.PQI="46.68:-68.03";
l.POE="31.03:-93.18";
l.POB="35.1599:-79";
l.PNS="30.46:-87.18";
l.PNM="45.55:-93.6";
l.PNE="40.06:-75";
l.PNC="36.71:-97.08";
l.PMD="34.61:-118.08";
l.PIT="40.4799:-80.2099";
l.PIE="27.9:-82.68";
l.PHX="33.43:-112";
l.PHN="42.9:-82.51";
l.PHL="39.86:-75.23";
l.PHF="37.11:-76.48";
l.PDX="45.58:-122.58";
l.PBI="26.66:-80.08";
l.PBG="44.65:-73.4599";
l.PBF="34.1599:-91.93";
l.PAM="30.06:-85.56";
l.PAE="47.9:-122.26";
l.ORL="28.53:-81.31";
l.ORF="36.88:-76.2";
l.ORD="41.96:-87.9";
l.OPF="25.9:-80.26";
l.ONT="34.05:-117.6";
l.OMA="41.3:-95.88";
l.OLS="31.41:-110.83";
l.OKC="35.38:-97.6";
l.OGS="44.6599:-75.45";
l.OFF="41.11:-95.9";
l.OAK="37.71:-122.21";
l.NZY="32.68:-117.2";
l.NZC="30.21:-81.86";
l.NYG="38.5:-77.3";
l.NXX="40.18:-75.13";
l.NXP="34.28:-116.15";
l.NUW="48.35:-122.65";
l.NUQ="37.4:-122.03";
l.NTU="36.81:-76.03";
l.NTK="33.7:-117.81";
l.NTD="34.11:-119.11";
l.NSE="30.71:-87.01";
l.NQX="24.56:-81.68";
l.NQI="27.5:-97.8";
l.NQA="35.35:-89.86";
l.NPA="30.35:-87.31";
l.NOW="48.13:-123.4";
l.NMM="32.55:-88.55";
l.NLC="36.31:-119.95";
l.NKX="32.86:-117.13";
l.NKT="34.9:-76.86";
l.NJK="32.81:-115.66";
l.NIP="30.23:-81.66";
l.NID="35.68:-117.68";
l.NHK="38.28:-76.4";
l.NGU="36.93:-76.28";
l.NFL="39.4:-118.7";
l.NEL="40.03:-74.35";
l.NCA="34.7:-77.43";
l.NBG="29.81:-90.03";
l.NBC="32.46:-80.7099";
l.MYR="33.6599:-78.91";
l.MXF="32.36:-86.35";
l.MWL="32.76:-98.05";
l.MWH="47.2:-119.31";
l.MUO="43.03:-115.86";
l.MUI="40.43:-76.56";
l.MTC="42.6:-82.81";
l.MSY="29.98:-90.25";
l.MSS="44.93:-74.83";
l.MSP="44.86:-93.2099";
l.MSN="43.13:-89.33";
l.MQT="46.53:-87.55";
l.MPV="44.2:-72.55";
l.MOT="48.25:-101.26";
l.MOD="37.61:-120.95";
l.MOB="30.68:-88.23";
l.MNM="45.11:-87.63";
l.MMV="45.18:-123.13";
l.MLU="32.5:-92.03";
l.MLT="45.63:-68.68";
l.MLC="34.86:-95.78";
l.MLB="28.1:-80.63";
l.MKO="35.65:-95.35";
l.MKL="35.58:-88.9";
l.MKE="42.93:-87.88";
l.MIV="39.36:-75.06";
l.MIB="48.4:-101.35";
l.MIA="25.78:-80.28";
l.MHR="38.55:-121.28";
l.MGE="33.9:-84.5";
l.MFE="26.16:-98.23";
l.MER="37.36:-120.56";
l.MEM="35.03:-89.9599";
l.MDW="41.78:-87.75";
l.MDT="40.18:-76.75";
l.MCO="28.41:-81.3";
l.MCN="32.68:-83.63";
l.MCI="39.28:-94.7";
l.MCF="27.83:-82.51";
l.MCC="38.6599:-121.4";
l.MAF="31.93:-102.2";
l.LUK="39.1:-84.41";
l.LUF="33.53:-112.36";
l.LTS="34.6599:-99.26";
l.LSV="36.2299:-115.03";
l.LSF="32.33:-84.98";
l.LRF="34.9099:-92.13";
l.LRD="27.53:-99.45";
l.LOU="38.21:-85.65";
l.LNK="40.85:-96.75";
l.LNA="26.58:-80.08";
l.LIT="34.71:-92.2099";
l.LHW="31.88:-81.55";
l.LGB="33.81:-118.15";
l.LGA="40.76:-73.86";
l.LFT="30.2:-91.98";
l.LFK="31.23:-94.75";
l.LFI="37.06:-76.35";
l.LCK="39.8:-82.91";
l.LCH="30.11:-93.2099";
l.LBB="33.65:-101.81";

l.LAX="33.93:-118.4";
l.LAS="36.06:-115.15";
l.LAN="42.76:-84.58";
l.JFK="40.63:-73.76";
l.JBR="35.81:-90.63";
l.JAX="30.48:-81.68";
l.JAN="32.3:-90.06";
l.ISP="40.78:-73.1";
l.ISN="48.1599:-103.63";
l.IPT="41.2299:-76.91";
l.IPL="32.83:-115.56";
l.INT="36.13:-80.2099";
l.INS="36.58:-115.66";
l.INL="48.55:-93.4";
l.INK="31.76:-103.2";
l.IND="39.71:-86.28";
l.ILM="34.26:-77.9";
l.ILG="39.6599:-75.6";
l.ABQ="35.03:-106.6";
l.IKK="41.06:-87.83";
l.ICT="37.63:-97.41";
l.IAH="29.96:-95.33";
l.IAG="43.1:-78.93";
l.IAD="38.93:-77.45";
l.IAB="37.61:-97.26";
l.HWO="26:-80.23";
l.HVR="48.53:-109.75";
l.HUL="46.11:-67.78";
l.HUF="39.45:-87.3";
l.HUA="34.6599:-86.68";
l.HTL="44.35:-84.66";
l.HST="25.48:-80.38";
l.HRT="30.41:-86.68";
l.HRO="36.25:-93.15";
l.HRL="26.21:-97.65";
l.HPN="41.06:-73.7";
l.HOU="29.63:-95.26";
l.HOP="36.6599:-87.48";
l.HON="44.38:-98.2099";
l.HOB="32.68:-103.2099";
l.HMN="32.85:-106.1";
l.HLR="31.13:-97.7";
l.HLN="46.6:-111.96";
l.HKY="35.7299:-81.38";
l.HIF="41.11:-111.96";
l.HIB="47.38:-92.83";
l.HHR="33.9099:-118.33";
l.HFD="41.7299:-72.65";
l.HBR="34.9799:-99.05";
l.GWO="33.4799:-90.08";
l.GVW="38.83:-94.55";
l.GVT="33.06:-96.05";
l.GUS="40.63:-86.15";
l.GTF="47.46:-111.36";
l.GTB="44.05:-75.7099";
l.GSB="35.33:-77.95";
l.GRR="42.86:-85.51";
l.GRK="31.06:-97.81";
l.GRF="47.06:-122.56";
l.GRB="44.4799:-88.11";
l.GNV="29.68:-82.26";
l.GNT="35.15:-107.9";
l.GLS="29.25:-94.85";
l.GGG="32.38:-94.7";
l.GFK="47.93:-97.16";
l.GEG="47.61:-117.53";
l.GCK="37.9099:-100.7099";
l.GAG="36.28:-99.76";
l.FYV="36:-94.16";
l.FXE="26.18:-80.16";
l.FTW="32.81:-97.35";
l.FTK="37.9:-85.9599";
l.FSM="35.33:-94.36";
l.FSI="34.63:-98.4";
l.FRI="39.05:-96.75";
l.FOK="40.83:-72.61";
l.FOE="38.95:-95.65";
l.FOD="42.55:-94.18";
l.FMY="26.58:-81.85";
l.FMN="36.7299:-108.21";
l.FMH="41.65:-70.51";
l.FLV="39.36:-94.9";
l.FLO="34.18:-79.7099";
l.FLL="26.06:-80.15";
l.FHU="31.58:-110.33";
l.FFO="39.81:-84.03";
l.FCS="38.6599:-104.75";
l.FAT="36.76:-119.71";
l.FAF="37.11:-76.6";
l.EYW="24.55:-81.75";
l.EWR="40.68:-74.16";
l.EWN="35.06:-77.03";
l.ESF="31.38:-92.28";
l.ENV="40.71:-114.01";
l.END="36.33:-97.9";
l.ELP="31.8:-106.36";
l.ELD="33.21:-92.8";
l.EKN="38.88:-79.85";
l.EGP="28.7:-100.4599";
l.EFD="29.6:-95.15";
l.EDW="34.9:-117.88";
l.ECG="36.25:-76.16";
l.DYS="32.4099:-99.85";
l.DUG="31.46:-109.6";
l.DTW="42.2:-83.35";
l.DSM="41.53:-93.65";
l.DRT="29.36:-100.91";
l.DRO="37.15:-107.75";
l.DRI="30.81:-93.33";
l.DPA="41.9:-88.23";
l.DOV="39.11:-75.45";
l.DMA="32.15:-110.86";
l.DLH="46.83:-92.18";
l.DLF="29.35:-100.76";


l.DHT="36.01:-102.53";
l.DHN="31.31:-85.43";
l.DFW="32.88:-97.03";
l.DET="42.4:-83";
l.DEN="39.85:-104.66";
l.DCA="38.85:-77.03";
l.DAY="39.9:-84.2099";
l.DAL="32.83:-96.85";
l.CYS="41.15:-104.8";
l.CXO="30.35:-95.4";
l.CXL="32.6599:-115.5";
l.CVS="34.36:-103.31";
l.CVG="39.03:-84.65";
l.CTB="48.6:-112.36";
l.CRP="27.76:-97.5";
l.CPR="42.9:-106.45";
l.COU="38.81:-92.2099";
l.COT="28.45:-99.2099";
l.COS="38.8:-104.7";
l.COF="28.23:-80.6";
l.CNW="31.63:-97.06";
l.CNM="32.33:-104.25";
l.CMH="39.9799:-82.88";
l.CLT="35.2:-80.93";
l.CLL="30.58:-96.35";
l.CLE="41.4:-81.83";
l.CIC="39.78:-121.85";
l.CHS="32.88:-80.03";
l.CHA="35.03:-85.2";
l.CFD="30.7:-96.31";
l.CEW="30.76:-86.51";
l.CEF="42.18:-72.53";
l.CDS="34.43:-100.28";
l.CDC="37.7:-113.08";
l.CBM="33.63:-88.43";
l.CAR="46.86:-68.01";
l.CAE="33.93:-81.11";
l.BYS="35.26:-116.61";
l.BYH="35.95:-89.93";
l.BWI="39.1599:-76.66";
l.BUR="34.2:-118.35";
l.BUF="42.93:-78.7099";
l.BTV="44.46:-73.15";
l.BTR="30.51:-91.13";
l.BRO="25.9:-97.41";
l.BPT="29.95:-94.01";
l.BOS="42.35:-71";
l.BOI="43.55:-116.21";
l.BNA="36.11:-86.66";
l.BLV="38.53:-89.83";
l.BLI="48.78:-122.53";
l.BKF="39.7:-104.75";
l.BIX="30.4:-88.91";
l.BIF="31.83:-106.36";
l.BHM="33.55:-86.75";
l.BGR="44.8:-68.81";
l.BFM="30.61:-88.06";
l.BFL="35.43:-119.05";
l.BFI="47.51:-122.3";
l.BED="42.46:-71.28";
l.BDR="41.15:-73.11";
l.BDL="41.93:-72.66";
l.BDE="48.71:-94.6";
l.BCT="26.36:-80.1";
l.BAD="32.5:-93.65";
l.BAB="39.13:-121.43";
l.AUS="30.18:-97.66";
l.AUG="44.31:-69.78";
l.ATL="33.63:-84.41";
l.ART="43.9799:-76.01";
l.ARA="30.03:91.88";
l.APG="39.45:-76.16";
l.AOO="40.28:-78.31";
l.AND="34.4799:-82.7";
l.ANB="33.58:-85.85";
l.AMA="35.21:-101.7";
l.ALI="27.73:-98.01";
l.ALB="42.7299:-73.8";
l.AKR="41.03:-81.4599";
l.AGS="33.36:-81.95";
l.AEX="31.31:-92.53";
l.ADW="38.8:-76.86";
l.ADM="34.3:-97.01";
l.ACY="39.45:-74.56";
l.ACT="31.6:-97.2099";
l.ACK="41.25:-70.05";
l.ABI="32.4:-99.66";
l.SRT="1.71:33.61";
l.EBB="0.03:32.43";
l.ZNZ="-6.21:39.21";
l.TGT="-5.08:39.06";
l.PMA="-5.25:39.8";
l.MWZ="-2.43:32.9099";
l.MYW="-10.33:40.1599";
l.QSI="-3.35:37.31";
l.JRO="-3.41:37.06";
l.IRI="-7.66:35.75";
l.DOD="-6.16:35.75";
l.DAR="-6.86:39.2";
l.ARK="-3.36:36.63";
l.WUU="7.71:27.96";
l.KRT="15.58:32.55";
l.PZU="19.56:37.2";
l.MAK="0.55:31.65";
l.JUB="4.86:31.6";
l.EBD="13.15:30.21";
l.UYL="12.05:24.95";
l.KSL="15.38:36.31";
l.ELF="13.6:25.31";
l.DOG="19.15:30.41";
l.KME="-2.45:28.9";
l.KGL="-1.96:30.13";
l.GYI="-1.66:29.25";
l.LTD="30.15:0.7";
l.TIP="32.65:13.15";
l.SEB="26.98:14.46";
l.BEN="32.08:20.26";
l.AKF="24.16:23.3";
l.GHT="25.13:10.13";
l.WJR="1.71:40.08";
l.NYK="-0.05:37.03";
l.WIL="-1.31:36.8";
l.NYE="-0.36:36.96";
l.OYL="3.46:39.1";
l.MBA="-4.03:39.58";
l.MYD="-3.21:40.1";
l.RBT="2.33:37.9799";
l.NDE="3.93:41.83";
l.LOY="2.75:36.71";
l.LAU="-2.25:40.9";
l.LOK="3.11:35.6";
l.KTL="0.96:34.95";
l.KIS="-0.08:34.71";
l.GAS="-0.45:39.63";
l.EDL="0.4:35.2299";
l.ELT="28.2:33.63";
l.ASW="23.95:32.81";
l.SKV="28.68:34.05";
l.PSD="31.26:32.2299";
l.MUH="31.31:27.21";
l.LXR="25.66:32.7";
l.HRG="27.18:33.78";
l.CAI="30.11:31.4";
l.ABS="22.36:31.6";
l.ALY="31.18:29.93";
l.MGQ="2:45.3";
l.KMU="-0.36:42.45";
l.BBO="10.38:44.93";
l.HGA="0.51:44.08";
l.BJM="-3.31:29.31";
l.MQX="13.46:39.53";
l.LLI="11.96:38.96";
l.JIM="7.65:36.8";
l.GDQ="12.51:37.4099";
l.GMB="0.11:34.55";
l.DIR="0.61:41.85";
l.BJR="11.6:37.31";
l.ADD="0.96:38.8";
l.VXE="16.8299:-25.05";
l.SNE="16.5799:-24.28";
l.MMO="15.15:-23.2";
l.RAI="14.91:-23.48";
l.BVC="16.13:-22.88";
l.SID="16.73:-22.93";
l.NZE="7.8:-0.7";
l.MCA="0.46:-0.51";
l.LEK="11.31:-12.28";
l.FAA="10.03:-10.76";
l.FIG="10.35:-13.56";
l.NDB="20.91:-17.01";
l.ATR="20.5:-13.03";
l.SEY="15.16:-12.2";
l.NKC="18.0799:-15.93";
l.KED="16.15:-13.5";
l.EMN="16.61:-7.3";
l.KFA="16.5799:-11.4";
l.TIY="18.56:-11.41";
l.IEO="16.7:-0.63";
l.TUD="13.73:-13.65";
l.KGG="12.56:-12.21";
l.BXE="14.83:-12.46";
l.XLS="16.03:-16.45";
l.DKR="14.73:-17.48";
l.KLC="14.13:-16.05";
l.CSK="12.4:-16.73";
l.KDA="12.86:-14.95";
l.ZIG="12.55:-16.26";
l.TNG="35.71:-5.91";
l.TTU="35.58:-5.3099";
l.AHU="35.1599:-3.83";
l.OZZ="30.93:-6.9";
l.NNA="34.28:-6.58";
l.RAK="31.6:-0.03";
l.CMN="33.36:-7.58";
l.SII="29.36:-10.16";
l.RBA="34.05:-6.75";
l.CAS="33.55:-7.65";
l.OUD="34.78:-1.91";
l.MEK="33.86:-5.5";
l.ERH="31.93:-4.4";
l.FEZ="33.9099:-4.96";
l.TTA="28.43:-11.15";
l.AGA="30.36:-0.53";
l.ROB="6.23:-10.35";
l.MLW="6.28:-10.75";
l.BXO="11.88:-15.65";
l.FNA="0.6:-13.18";
l.HGS="0.38:-13.11";
l.MLN="35.26:-2.95";
l.TFN="28.46:-16.3299";
l.TFS="28.03:-16.56";
l.ACE="28.93:-13.6";
l.LPA="27.91:-15.38";
l.SPC="28.61:-17.75";
l.VDE="27.8:-17.88";
l.FUE="28.45:-13.85";
l.BJL="13.33:-16.65";
l.TOM="16.71:-3";
l.NIX="15.23:-0.56";
l.MZI="14.5:-4.0599";
l.KYS="14.41:-11.43";
l.BKO="12.53:-7.93";
l.MJM="-6.11:23.56";
l.KGA="-5.9:22.46";
l.KMN="-0.63:25.25";
l.FMI="-5.86:29.25";
l.KWZ="-10.75:25.5";
l.FBM="-11.58:27.51";
l.KND="-2.91:25.9";
l.GOM="-1.66:29.23";
l.BUX="1.55:30.21";
l.IRP="2.81:27.58";
l.FKI="0.51:25.15";
l.LIQ="2.16:21.48";
l.GMA="3.23:19.76";
l.BDT="4.25:20.96";
l.MDK="0.01:18.28";
l.KKW="-5.03:18.78";
l.FDU="-3.3:17.36";
l.MAT="-5.78:13.43";
l.MNB="-5.91:12.35";
l.NLO="-4.3099:15.31";
l.FIH="-4.38:15.43";
l.MSU="-29.45:27.55";
l.ZZU="-11.43:34";
l.KGJ="-0.95:33.88";
l.BLZ="-15.66:34.96";
l.WKM="-18.61:27.01";
l.GWE="-19.43:29.85";
l.MVZ="-20.05:30.85";
l.KAB="-16.51:28.88";
l.HRE="-17.91:31.08";
l.UTA="-18.96:32.45";
l.VFA="-18.0799:25.8299";
l.BFO="-21:31.56";
l.BUQ="-20.01:28.61";
l.FYT="17.91:19.1";
l.PLF="0.36:14.91";
l.NDJ="12.13:15.03";
l.MQQ="0.61:16.06";
l.AEH="13.83:20.8299";
l.SRH="0.15:18.36";
l.PRI="-4.3099:55.68";
l.SEZ="-4.66:55.51";
l.DES="-5.68:53.65";
l.VNX="-22.01:35.3";
l.TET="-16.1:33.63";
l.UEL="-17.85:36.86";
l.POL="-12.98:40.51";
l.APL="-15.1:39.26";
l.MNC="-14.48:40.7";
l.MZB="-11.35:40.35";
l.MPM="-25.91:32.56";
l.VXC="-13.26:35.25";
l.INH="-23.86:35.4";
l.FXO="-14.81:36.51";
l.BEW="-19.78:34.9";
l.TMS="0.36:6.7";
l.PCP="1.65:7.4";
l.TCH="-2.88:10.91";
l.LTL="-0.81:12.73";
l.MVB="-1.65:13.43";
l.MZC="0.76:11.55";
l.LBV="0.45:0.4";
l.MKU="0.56:12.88";
l.OMB="-1.56:0.25";
l.POG="-0.7:0.75";
l.MFF="-1.53:13.26";
l.BMM="2.06:11.48";
l.LBQ="-0.7:10.23";
l.OKN="-0.65:13.66";
l.OYE="1.53:11.56";
l.XGN="-16.75:14.95";
l.UGO="-7.6:15.01";
l.LUO="-11.76:19.88";
l.SZA="-6.13:12.36";
l.VHC="-0.68:20.41";
l.PBN="-10.71:13.75";
l.GXG="-7.75:15.28";
l.SPP="-14.65:17.71";
l.MEG="-0.51:16.3";
l.LAD="-0.85:13.21";
l.SVP="-12.4:16.93";
l.NOV="-12.8:15.75";
l.NGV="-17.03:15.68";
l.CAV="-11.88:22.9";
l.PGI="-7.35:20.8";
l.CAB="-5.58:12.18";
l.BUG="-12.6:13.4";
l.SSY="-6.26:14.23";
l.TLE="-23.38:43.71";
l.MXM="-21.75:43.36";
l.MNJ="-21.2:48.35";
l.WVK="-22.11:48.01";
l.RVA="-22.8:47.81";
l.WFI="-21.43:47.1";
l.FTU="-25.03:46.95";
l.WAI="-14.88:47.9799";
l.VOH="-13.36:50";
l.SVB="-14.26:50.1599";
l.WMN="-15.43:49.68";
l.BPY="-16.73:44.46";
l.NOS="-13.3:48.3";
l.MJN="-15.66:46.35";
l.HVA="-14.61:47.75";
l.ANM="-14.98:50.31";
l.AMB="-13.18:48.9799";
l.ZWA="-14.65:49.61";
l.WMR="-16.15:49.76";
l.DIE="-12.33:49.28";
l.MOQ="-20.28:44.31";
l.TMM="-18.1:49.38";
l.SMS="-17.0799:49.8";
l.ZVA="-19.55:45.45";
l.TNR="-18.78:47.46";
l.ZSE="-21.31:55.41";
l.RUN="-20.88:55.5";
l.DZA="-12.8:45.26";
l.AJN="-12.11:44.4099";
l.YVA="-11.7:43.2299";
l.NWA="-12.28:43.75";
l.HAH="-11.53:43.26";
l.KIW="-12.9:28.13";
l.NLA="-12.98:28.65";
l.MFU="-13.25:31.93";
l.LUN="-15.31:28.45";
l.LVI="-17.81:25.81";
l.YAO="3.83:11.51";
l.BPC="6.03:10.11";
l.BFX="5.53:10.35";
l.GOU="0.33:13.36";
l.NGE="7.35:13.55";
l.FOM="5.63:10.75";
l.MVR="10.45:14.25";
l.OUR="4.46:14.35";
l.DLA="4:0.71";
l.TKC="4.08:0.35";
l.RRG="-19.75:63.35";
l.MRU="-20.41:57.68";
l.SSG="3.75:0.7";
l.BSG="1.9:0.8";
l.AIG="45.15:-89.1";
l.BBT="4.21:15.78";
l.BIV="6.51:21.98";
l.BOP="5.95:15.63";
l.NDL="0.41:20.63";
l.BBY="5.83:20.63";
l.IRO="10.23:22.71";
l.BGU="4.78:22.76";
l.BGF="4.38:18.51";
l.MTS="-26.51:31.3";
l.PNR="-4.8:11.88";
l.DIS="-4.2:12.65";
l.KMK="-3.48:12.61";
l.OUE="1.6:16.03";
l.FTX="-0.51:15.95";
l.MKJ="-0.01:15.56";
l.ION="1.58:18.03";
l.BZV="-4.25:15.25";
l.PKW="-22.05:27.81";
l.GBE="-24.55:25.91";
l.ORP="-21.25:25.31";
l.MUB="-19.96:23.41";
l.BBK="-17.81:25.15";
l.JWA="-24.6:24.68";
l.FRW="-21.15:27.46";
l.WEL="-27.98:26.66";
l.PRY="-25.65:28.21";
l.VYD="-27.78:30.78";
l.VIR="-29.76:31.05";
l.VRU="-26.96:24.71";
l.UTT="-31.53:28.66";
l.UTN="-28.4:21.25";
l.ULD="-28.31:31.4";
l.LTA="-23.81:30.31";
l.TCU="-29.31:26.81";
l.THY="-23.06:30.38";
l.SZK="-24.95:31.58";
l.SIS="-27.63:22.98";
l.SBU="-29.68:17.93";
l.RCB="-28.73:32.08";
l.UTW="-31.91:26.86";
l.NTY="-25.3299:27.16";
l.PZB="-29.63:30.38";
l.PTG="-23.91:29.48";
l.PHW="-23.93:31.15";
l.PLZ="-33.9799:25.61";
l.DUH="-33.6:22.18";
l.NLP="-25.5:30.9";
l.NCS="-27.76:29.96";
l.MEZ="-22.35:29.98";
l.MBO="-25.78:25.53";
l.MFK="-25.75:25.6";
l.MGH="-30.85:30.33";
l.LAY="-28.56:29.73";
l.LCD="-23.15:29.68";
l.HLA="-25.93:27.91";
l.KLZ="-29.68:17.0799";
l.KIM="-28.8:24.75";
l.JNB="-26.13:28.23";
l.HDS="-24.36:31.03";
l.GHC="-26.5:28.38";
l.HCS="-26.23:28.15";
l.GRJ="-34:22.36";
l.GCJ="-25.98:28.13";
l.ELL="-23.71:27.68";
l.ELS="-33.03:27.81";
l.DUR="-29.96:30.95";
l.CPT="-33.95:18.6";
l.BFN="-29.08:26.3";
l.VIY="-32.88:27.26";
l.AGZ="-29.26:18.8";
l.ALJ="-28.56:16.53";
l.BGN="51.18:6.11";
l.GUT="51.9099:0.3";
l.LRC="51.6:6.13";
l.FEL="48.2:11.26";
l.RLG="53.91:12.26";
l.GKE="50.95:6.03";
l.QHD="49.38:0.65";
l.ZNF="50.1599:0.95";
l.ZCN="52.58:10.01";
l.GHF="49.63:0.95";
l.RMS="49.43:7.6";
l.SPM="49.96:6.68";
l.VBY="57.65:18.3299";
l.NRK="58.58:16.25";
l.LPI="58.4:15.66";
l.GVX="60.58:16.95";
l.HLF="57.51:15.81";
l.BLE="60.41:15.5";
l.BMA="59.35:17.93";
l.ARN="59.65:17.91";
l.OSD="63.18:14.5";
l.LLA="65.53:22.11";
l.VST="59.58:16.63";
l.ORB="59.21:15.03";
l.AJR="65.58:19.26";
l.VHM="64.56:16.8299";
l.UME="63.78:20.26";
l.SFT="64.61:21.06";
l.KRN="67.81:20.3299";
l.OER="63.4:18.98";
l.SDL="62.51:17.43";
l.LYC="64.53:18.7";
l.KRF="63.03:17.76";
l.HUV="61.76:17.06";
l.GEV="67.11:20.8";
l.EVG="62.03:14.41";
l.VXO="56.91:14.71";
l.HAD="56.68:12.81";
l.MMX="55.51:13.36";
l.KLR="56.68:16.28";
l.OSK="57.35:16.48";
l.JLD="55.93:12.85";
l.KID="55.91:14.08";
l.NYO="58.78:16.9";
l.MXX="60.95:14.5";
l.KSK="59.33:14.48";
l.THN="58.31:12.33";
l.KVB="58.45:13.96";
l.GSE="57.76:11.86";
l.LDK="58.45:13.16";
l.JKG="57.75:14.06";
l.GOT="57.65:12.26";
l.RNB="56.26:15.25";
l.AGH="56.28:12.83";
l.IEG="52.13:15.78";
l.WRO="51.1:16.88";
l.WAW="52.15:20.96";
l.OSP="54.46:17.1";
l.SZZ="53.58:14.9";
l.RZE="50.1:22.01";
l.POZ="52.4099:16.81";
l.KTW="50.46:19.06";
l.KRK="50.06:19.78";
l.GDN="54.36:18.45";
l.SVG="58.86:5.63";
l.TRD="63.45:10.93";
l.TRF="59.18:10.25";
l.TOS="69.68:18.91";
l.SSJ="65.95:12.46";
l.SOJ="69.78:20.95";
l.SRP="59.78:5.33";
l.SKE="59.18:0.56";
l.SOG="61.15:7.13";
l.LYR="78.23:15.45";
l.RRS="62.56:11.33";
l.OLA="63.68:0.6";
l.LKL="70.06:24.96";
l.MJF="65.78:13.2";
l.MOL="62.73:7.26";
l.FAN="58.1:6.61";
l.KKN="69.7099:29.88";
l.KSU="63.1:7.81";
l.HAA="70.48:22.13";
l.HAU="59.33:5.2";
l.HMR="60.81:11.06";
l.OSL="60.18:11.1";
l.FRO="61.58:5.01";
l.VDB="61:0.28";
l.FBU="59.88:10.61";
l.EVE="68.48:16.66";
l.BDU="69.05:18.53";
l.KRS="58.2:0.08";
l.BJF="70.6:29.68";
l.BGO="60.28:5.21";
l.BOO="67.26:14.35";
l.BNN="65.45:12.2";
l.ALF="69.9599:23.35";
l.ANX="69.28:16.13";
l.AES="62.55:6.1";
l.LUX="49.61:6.2";
l.AAL="57.08:0.83";
l.STA="55.98:0.35";
l.FAE="62.05:-7.26";
//l.TED="57.06:0.7";
l.SKS="55.21:0.25";
l.SGD="54.95:0.78";
l.RNN="55.05:14.75";
l.RKE="55.58:12.11";
l.ODE="55.46:10.31";
l.KRP="56.28:0.11";
l.EBJ="55.51:0.55";
l.CPH="55.61:12.65";
l.BLL="55.73:0.15";
l.AAR="56.3:10.61";
l.WAT="52.18:-7.08";
l.SXL="54.26:-0.58";
l.SNN="52.7:-0.91";
l.KIR="52.1599:-0.51";
l.NOC="53.9:-0.81";
l.DUB="53.41:-6.26";
l.GWY="53.3:-0.93";
l.ORK="51.83:-0.48";
l.WOE="51.43:4.33";
l.LID="52.1599:4.41";
l.ENS="52.26:6.86";
l.UTC="52.11:5.26";
l.RTM="51.95:4.43";
l.LWR="53.21:5.75";
l.DHR="52.91:4.76";
l.GRQ="53.11:6.56";
l.EIN="51.45:5.36";
l.MST="50.9:5.76";
l.AMS="52.3:4.75";
l.MPN="-51.81:-58.43";
l.KNF="52.63:0.55";
l.CLF="52.75:1.35";
l.WTN="53.15:-0.51";
l.BEQ="52.33:0.76";
l.QCY="53.08:-0.15";
l.NHT="51.55:-0.41";
l.ODH="51.2299:-0.93";
l.BZZ="51.7299:-1.58";
l.FFD="51.6599:-1.78";
l.MHZ="52.35:0.48";
l.OXF="51.83:-1.31";
l.HTF="51.76:0.25";
l.FZO="51.51:-2.58";
l.EXT="50.7299:-3.4";
l.STN="51.88:0.23";
l.NWI="52.66:1.26";
l.CBG="52.2:0.16";
l.LMO="57.7:-3.33";
l.ADX="56.36:-2.86";
l.TRE="56.48:-6.86";
l.SYY="58.2:-6.3099";
l.DND="56.45:-3.0099";
l.SDZ="60.41:-1.28";
l.BEB="57.46:-7.35";
l.PIK="55.5:-4.58";
l.ILY="55.66:-6.25";
l.EDI="55.95:-3.36";
l.GLA="55.86:-4.41";
l.INV="57.53:-4.05";
l.ABZ="57.2:-2.2";
l.WIC="58.45:-3.08";
l.LSI="59.86:-1.28";
l.KOI="58.95:-2.9";
l.EMA="52.81:-1.31";
l.MME="54.5:-1.41";
l.NCL="55.03:-1.68";
l.IOM="54.08:-4.61";
l.CEG="53.16:-2.96";
l.LBA="53.85:-1.65";
l.BWF="54.11:-3.25";
l.HUY="53.56:-0.35";
l.BLK="53.76:-3.0099";
l.CAX="54.93:-2.8";
l.MSE="51.33:1.33";
l.LYX="50.95:0.93";
l.SEN="51.56:0.68";
l.LHR="51.46:-0.45";
l.BBS="51.31:-0.83";
l.FAB="51.26:-0.76";
l.LCY="51.5:0.05";
l.LGW="51.13:-0.18";
l.BQH="51.31:0.01";
l.ESH="50.83:-0.28";
l.JER="49.2:-2.18";
l.GCI="49.43:-2.6";
l.QLA="51.18:-1.01";
l.SOU="50.95:-1.35";
l.BOH="50.76:-1.83";
l.PLH="50.4099:-4.1";
l.LTN="51.86:-0.36";
l.LPL="53.33:-2.83";
l.BRS="51.36:-2.71";
l.SWS="51.6:-4.0599";
l.CWL="51.38:-3.33";
l.YEO="51:-2.63";
l.LYE="51.5:-1.98";
l.NQY="50.43:-4.98";
l.MAN="53.35:-2.2599";
l.GLO="51.88:-2.16";
l.CVT="52.36:-1.46";
l.BHX="52.45:-1.73";
l.LDY="55.03:-7.15";
l.BHD="54.61:-5.86";
l.ENK="54.38:-7.65";
l.BFS="54.65:-6.2";
l.VRK="62.16:27.86";
l.VAA="63.05:21.75";
l.QVY="60.88:26.93";
l.TKU="60.5:22.25";
l.TMP="61.4:23.6";
l.SOT="67.38:26.61";
l.SVL="61.93:28.93";
l.RVN="66.55:25.81";
l.POR="61.45:21.78";
l.OUL="64.91:25.35";
l.MIK="61.68:27.2";
l.MHQ="60.11:19.88";
l.LPP="61.03:28.13";
l.KUO="63:27.78";
l.KTT="67.7:24.8299";
l.KAO="65.98:29.23";
l.KOK="63.71:23.13";
l.KAJ="64.28:27.68";
l.KEM="65.76:24.5799";
l.KAU="63.11:23.05";
l.JYV="62.38:25.66";
l.JOE="62.65:29.61";
l.IVL="68.6:27.4";
l.HEL="60.31:24.95";
l.HEM="60.25:25.03";
l.KEV="61.85:24.78";
l.ENF="68.35:23.41";
l.TLL="59.4:24.81";
l.GWT="54.9:0.33";
l.NRD="53.7:7.21";
l.BMK="53.58:6.7";
l.WVN="53.5:0.05";
l.EME="53.38:7.21";
l.LEM="53.13:0.61";
l.BRV="53.5:0.56";
l.KSF="51.4:0.36";
l.BWE="52.31:10.55";
l.ZQL="47.96:0.51";
l.ZCC="48.78:0.18";
l.ZQC="49.3:0.45";
l.ZQF="49.85:6.78";
l.ZNV="50.31:7.51";
l.HOQ="50.28:11.85";
l.BYU="49.9799:11.63";
l.SZW="53.41:11.78";
l.FDH="47.6599:0.5";
l.OBF="48.06:11.28";
l.AGB="48.4099:10.91";
l.DTM="51.51:7.6";
l.PAD="51.6:0.6";
l.MGL="51.21:6.5";
l.ESS="51.4:6.93";
l.ZCA="51.4799:7.88";
l.AAH="50.81:6.18";
l.LBC="53.8:10.71";
l.KEL="54.36:10.13";
l.XFW="53.53:0.83";
l.MHG="49.46:0.5";
l.HHN="49.93:7.25";
l.BRE="53.03:0.78";
l.HAJ="52.45:0.68";
l.TXL="52.55:13.28";
l.STR="48.68:0.21";
l.SCN="49.2:7.1";
l.LEJ="51.4099:12.23";
l.NUE="49.4799:11.06";
l.MUC="48.35:11.78";
l.DUS="51.28:6.76";
l.CGN="50.85:7.13";
l.THF="52.46:13.4";
l.HAM="53.61:0.98";
l.FRA="50.01:0.53";
l.ERF="50.96:10.95";
l.DRS="51.11:13.76";
l.SXF="52.36:13.51";
l.GWW="35.45:-77.95";
l.AOC="50.96:12.5";
l.BBJ="51.18:14.51";
l.OST="51.18:2.85";
l.LGG="50.63:5.43";
l.QKT="50.81:3.2";
l.CRL="50.45:4.45";
l.BRU="50.9:4.48";
l.ANR="51.18:4.45";
l.LFW="6.15:1.25";
l.LRL="0.76:1.08";
l.TOE="33.93:0.1";
l.SFA="34.71:10.68";
l.EBM="31.7:0.25";
l.DJE="33.86:10.76";
l.GAE="33.86:10.1";
l.GAF="34.4099:0.81";
l.TUN="36.85:10.21";
l.MIR="35.75:10.75";
l.ZND="13.76:0.98";
l.AJY="16.95:7.98";
l.THZ="14.86:5.25";
l.NIM="13.46:2.18";
l.MFG="13.5:7.11";
l.ZAR="11.11:7.68";
l.YOL="0.25:12.41";
l.SKO="12.9:5.2";
l.PHC="5:6.93";
l.MXJ="0.65:6.45";
l.LOS="6.56:3.31";
l.MDI="7.7:0.6";
l.MIU="11.85:13.06";
l.KAN="12.03:0.51";
l.KAD="10.68:7.31";
l.JOS="0.63:0.86";
l.ILR="0.43:4.48";
l.IBA="7.35:3.96";
l.QUS="12.16:6.68";
l.ENU="6.46:7.55";
l.CBQ="4.96:0.33";
l.BNI="6.3099:5.58";
l.AKR="7.23:5.3";
l.ABV="0:7.25";
l.ASK="6.9:-5.35";
l.SPY="4.73:-6.65";
l.MJC="7.26:-7.58";
l.HGO="0.38:-5.55";
l.DJO="6.78:-6.46";
l.BYK="7.73:-5.0599";
l.ABJ="5.25:-3.91";
l.TKD="4.88:-1.76";
l.NYI="7.35:-2.31";
l.TML="0.55:-0.85";
l.ACC="5.6:-0.16";
l.BOY="11.15:-4.3099";
l.OUA="12.35:-1.5";
l.PKO="0.35:2.6";
l.COO="6.35:2.38";
l.IAM="28.05:0.63";
l.OGX="31.91:5.4";
l.TMX="29.23:0.26";
l.LOO="33.75:2.91";
l.TGR="33.06:6.08";
l.INZ="27.25:2.5";
l.HME="31.66:6.13";
l.GHA="32.38:3.78";
l.ELG="30.56:2.85";
l.BSK="34.78:5.73";
l.AZR="27.83:-0.18";
l.MUW="35.2:0.13";
l.ORN="35.61:-0.61";
l.TLM="35.01:-1.45";
l.TAF="35.53:-0.51";
l.QAS="36.2:1.31";
l.TIN="27.7:-0.16";
l.TID="35.33:1.45";
l.HRM="32.9099:3.3";
l.TEE="35.4099:0.11";
l.CZL="36.26:6.61";
l.AAE="36.81:7.8";
l.GJL="36.78:5.86";
l.TMR="22.8:5.45";
l.GSF="36.1599:5.3099";
l.VVZ="26.56:0.48";
l.DJG="24.28:0.45";
l.ALG="36.68:3.2";
l.BJA="36.7:5.0599";
l.ZFM="67.4:-134.85";
l.ZFA="62.2:-133.36";
l.YZX="44.9799:-64.91";
l.YZW="60.16:-132.73";
l.YZV="50.21:-66.25";
l.YZU="54.13:-115.78";
l.YZT="50.6599:-127.36";
l.YZR="42.9799:-82.3";
l.YZP="53.25:-131.8";
l.YZH="55.28:-114.76";
l.YZF="62.45:-114.43";
l.YZE="45.88:-82.56";
l.YZD="43.7299:-79.45";
l.YYZ="43.6599:-79.61";
l.YYY="48.6:-68.2";
l.YYW="50.28:-88.9";
l.YYU="49.4:-82.4599";
l.YYT="47.61:-52.75";
l.YYR="53.31:-60.41";
l.YYQ="58.73:-94.05";
l.YYN="50.28:-107.68";
l.YYL="56.85:-101.06";
l.YYJ="48.63:-123.41";
l.YYH="69.53:-93.56";
l.YYG="46.28:-63.11";
l.YYF="49.45:-119.6";
l.YYE="58.83:-122.58";
l.YYD="54.81:-127.16";
l.YYC="51.1:-114.01";
l.YYB="46.35:-79.41";
l.YXY="60.7:-135.06";
l.YXX="49.01:-122.35";
l.YXU="43.03:-81.15";
l.YXT="54.45:-128.56";
l.YXS="53.88:-122.66";
l.YXR="47.68:-79.83";
l.YXP="66.13:-65.7";
l.YXL="50.1:-91.9";
l.YXJ="56.23:-120.73";
l.YXH="50.01:-110.71";
l.YXE="52.1599:-106.68";
l.YXD="53.56:-113.51";
l.YXC="49.6:-115.76";
l.YWY="63.2:-123.43";
l.YWL="52.1599:-122.05";
l.YWK="52.91:-66.85";
l.YWG="49.9:-97.23";
l.YWA="45.95:-77.31";
l.YVV="44.7299:-81.1";
l.YVT="55.83:-108.41";
l.YVR="49.18:-123.16";
l.YVQ="65.26:-126.8";
l.YVP="58.08:-68.41";
l.YVO="48.05:-77.76";
l.YVM="67.53:-64.01";
l.YVG="53.35:-110.81";
l.YVC="55.15:-105.25";
l.YUY="48.2:-78.83";
l.YUX="68.76:-81.23";
l.YUT="66.51:-86.2099";
l.YUL="45.46:-73.73";
l.YUB="69.43:-133.01";
l.YTZ="43.61:-79.38";
l.YTS="48.56:-81.36";
l.YTR="44.11:-77.51";
l.YTH="55.8:-97.85";
l.YTE="64.2099:-76.51";
l.YSY="71.98:-125.23";
l.YSU="46.43:-63.81";
l.YSR="72.9599:-84.6";
l.YSM="60.01:-111.95";
l.YSJ="45.3:-65.88";
l.YSC="45.43:-71.68";
l.YSB="46.61:-80.78";
l.YRT="62.8:-92.1";
l.YRM="52.4099:-114.9";
l.YRJ="48.51:-72.25";
l.YRI="47.75:-69.58";
l.YRB="74.7099:-94.9599";
l.YQZ="53.01:-122.5";
l.YQY="46.15:-60.03";
l.YQX="48.93:-54.56";
l.YQW="52.76:-108.23";
l.YQV="51.25:-102.45";
l.YQU="55.16:-118.88";
l.YQT="48.36:-89.31";
l.YQR="50.4099:-104.65";
l.YQQ="49.7:-124.88";
l.YQM="46.1:-64.66";
l.YQL="49.61:-112.78";
l.YQK="49.78:-94.35";
l.YQH="60.11:-128.81";
l.YQG="42.26:-82.95";
l.YQF="52.1599:-113.88";
l.YQB="46.78:-71.38";
l.YQA="44.96:-79.3";
l.YPY="58.76:-111.11";
l.YPR="54.28:-130.43";
l.YPQ="44.21:-78.35";
l.YPN="49.83:-64.28";
l.YPL="51.43:-90.2";
l.YPG="49.9:-98.26";
l.YPE="56.21:-117.43";
l.YPA="53.2:-105.66";
l.YOW="45.31:-75.66";
l.YOJ="58.61:-117.15";
l.YOD="54.4:-110.26";
l.YOC="67.56:-139.83";
l.YNM="49.75:-77.8";
l.YND="45.51:-75.55";
l.YNA="50.18:-61.78";
l.YMX="45.6599:-74.03";
l.YMW="46.26:-75.98";
l.YMO="51.28:-80.6";
l.YMM="56.65:-111.21";
l.YMJ="50.31:-105.55";
l.YMA="63.61:-135.86";
l.YLW="49.95:-119.36";
l.YLT="82.51:-62.26";
l.YLL="53.3:-110.06";
l.YLJ="54.11:-108.51";
l.YLD="47.81:-83.33";
l.YKZ="43.85:-79.36";
l.YKY="51.51:-109.16";
l.YKL="54.8:-66.8";
l.YKF="43.45:-80.38";
l.YKA="50.7:-120.43";
l.YJT="48.53:-58.55";
l.YJN="45.28:-73.26";
l.YIO="72.68:-77.9599";
l.YIB="48.76:-91.63";
l.YHZ="44.86:-63.5";
l.YHY="60.83:-115.76";
l.YHU="45.51:-73.41";
l.YHM="43.1599:-79.93";
l.YHK="68.63:-95.83";
l.YHI="70.75:-117.8";
l.YHD="49.81:-92.73";
l.YHB="52.81:-102.3";
l.YGX="56.35:-94.7";
l.YGW="55.28:-77.76";
l.YGR="47.4099:-61.76";
l.YGQ="49.76:-86.93";
l.YGP="48.76:-64.4599";
l.YGL="53.61:-77.7";
l.YGK="44.21:-76.58";
l.YFS="61.75:-121.23";
l.YFR="61.16:-113.68";
l.YFO="54.66:-101.66";
l.YFC="45.86:-66.51";
l.YFB="63.75:-68.55";
l.YEV="68.3:-133.46";
l.YEU="79.98:-85.8";
l.YET="53.56:-116.45";
l.YEN="49.2:-102.95";
l.YEK="61.08:-94.06";
l.YEG="53.3:-113.56";
l.YED="53.66:-113.46";
l.YDQ="55.73:-120.16";
l.YDN="51.1:-100.05";
l.YDL="58.41:-130.01";
l.YDF="49.2:-57.38";
l.YDC="49.46:-120.5";
l.YDB="61.36:-139.03";
l.YDA="64.03:-139.11";
l.YZS="50.31:-115.86";
l.YCY="70.48:-68.51";
l.YCW="49.15:-121.93";
l.YCT="52.06:-111.43";
l.YCO="67.81:-115.13";
l.YCL="47.9799:-66.31";
l.YCH="47:-65.43";
l.YCG="49.28:-117.61";
l.YCD="49.05:-123.86";
l.YCB="69.1:-105.13";
l.YBR="49.9:-99.95";
l.YBL="49.95:-125.26";
l.YBK="64.28:-96.06";
l.YBG="48.31:-70.98";
l.YBC="49.11:-68.2";
l.YBB="68.53:-89.8";
l.YAZ="49.06:-125.76";
l.YAY="51.38:-56.08";
l.YAW="44.63:-63.48";
l.YAV="50.05:-97.01";
l.YAM="46.4799:-84.5";
l.VEY="63.41:-20.26";
l.SIJ="66.13:-18.91";
l.RKV="64.11:-21.93";
l.PFJ="65.55:-23.95";
l.OPA="66.3:-16.45";
l.KEF="63.98:-22.6";
l.IFJ="66.05:-23.13";
l.HZK="65.95:-17.41";
l.HFN="64.28:-15.21";
l.EGS="65.28:-14.4";
l.AEY="65.65:-18.06";
l.THU="76.51:-68.7";
l.SFJ="67.01:-50.68";
l.KUS="65.58:-37.15";
l.JAV="69.23:-51.06";
l.GOH="64.18:-51.6599";
l.UAK="61.15:-45.4099";
l.WWK="-3.58:143.66";
l.POM="-0.43:147.21";
l.LAE="-6.56:146.71";
l.HGU="-5.81:144.28";
l.MAG="-5.2:145.78";
l.GKA="-6.0599:145.38";

return(eval('l.'+location));
}

//////	End oil calcs