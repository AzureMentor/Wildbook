/*

These functions create the many HTML components in the page. Many are nested together. 
There are listed in decending as much at that is applicable, ie imageTile contains an imageDataOverlay which contains 
an encNumDropdown ect.

*/


multipleSubmitUI = {

    getImageIdForIndex: function(index) {
        return "img-"+String(index);
    },
    
    getImageUIIdForIndex: function(index) {
        return "img-input-"+String(index);
    },

    getEncInputClassForIndex: function(index) {
        return "img-input-"+String(index);
    },

    generateMetadataTile: function(index) {
        var metadataTile = "";
        metadataTile += "<div class=\"encounter-tile-div col-xs-12 col-xl-12\">";

        metadataTile += "   <p>";
        metadataTile += "       <label class=\"encounter-label\">&nbspShow Encounter #"+index+"&nbsp</label>";
        metadataTile += "       <label class=\"btn btn-default btn-sm\" onclick=\"showEditMetadata("+index+")\">Show Details</label>";
        metadataTile += "   </p>";

        metadataTile +=	"   <div id=\"enc-metadata-inner-"+index+"\" class=\"edit-closed\">";	
        metadataTile +=         ("<p>"+multipleSubmitUI.generateLocationDropdown(index)+"</p>");
        metadataTile +=	"	    <p><input name=\"encDate\" title=\"Sighting Date/Time\" type=\"text\" placeholder=\"Enter Date\" class=\"encDate\"/></p>";
        metadataTile +=	"       <textarea class=\"\" placeholder=\"More Info\" rows=\"5\" cols=\"36\" />";
        metadataTile += "       <label>&nbsp;</label>";
        metadataTile +=	"   </div>";
        	   
        metadataTile += "   <br/>";
        metadataTile += "</div>";
        return metadataTile;
    }, 

    generateImageTile: function(file, index) {
        var imageTile = "";
        imageTile += "<div id=\"image-tile-div-"+index+"\" class=\"image-tile-div col-xs-6 col-sm-4 col-md-3 col-lg-3 col-xl-3\" onclick=\"imageTileClicked("+index+")\" onmouseover=\"showOverlay("+index+")\" onmouseout=\"hideOverlay("+index+")\" >";
        //imageTile += "  <label class=\"image-filename\">File: "+file.name+"</label>";
        imageTile += "  <img class=\"image-element\" id=\""+multipleSubmitUI.getImageIdForIndex(index)+"\" src=\"#\" alt=\"Displaying "+file.name+"\" />";
        imageTile += multipleSubmitUI.generateImageDataOverlay(file,index);                
        imageTile += "</div>";
        //console.log("image tile: "+imageTile);
        return imageTile;
    },
                    
    generateImageDataOverlay: function(file,index) {
        var uiClass = multipleSubmitUI.getImageUIIdForIndex(index);
        var overlay = "";
        overlay += "  <div hidden id=\"img-overlay-"+index+"\" class=\"img-overlay-"+index+" img-input "+uiClass+"\" >";
        overlay += "      <label class=\""+uiClass+"\">File: "+file.name+"</label>";
        // make a "click to focus" prompt here on hover
        overlay += multipleSubmitUI.generateEncNumDropdown(index);
        overlay += "      <textarea class=\""+uiClass+"\" placeholder=\"More Info\" rows=\"3\" cols=\"23\" />";                     
        overlay += "  </div>";
        return overlay; 
    },
    
    generateEncNumDropdown: function(index) { 
        var uiClass = multipleSubmitUI.getImageUIIdForIndex(index);
        var encDrop = "";
        encDrop += "<select class=\""+uiClass+"\" name=\"enc-num-dropdown-"+index+"\">";
        encDrop += "    <option selected=\"selected\" value=\""+i+"\" disabled>Choose Encounter Number</option>";
        for (var i=0;i<multipleSubmitUI.encsDefined();i++) {
            encDrop += "<option value=\""+i+"\">"+(i+1)+"</option>";
        }
        encDrop += "</select>";
        return encDrop;
    },

    generateLocationDropdown: function(index) {
        var uiClass = multipleSubmitUI.getEncInputClassForIndex(index);
        var uiId = "loc-" + uiClass;
        var dd = "";
        dd += "<select id=\""+uiId+"\" class=\""+uiClass+"\" name=\"enc-num-dropdown-"+index+"\">";
        dd += "    <option selected=\"selected\" value=\"null\" disabled>Choose Location</option>";
        // This is async so we will add it to option list after return.
        // What happens if this comes back before the page renders? Fire? Panic? Death? 
        multipleSubmitAPI.getLocations(function(locObj){
            var ddLocs = "";
            if (locObj.hasOwnProperty('locationIds')) {
                var locs = locObj.locationIds;
                console.log("Type? "+(typeof locs));
                //console.log("----------------> locs: "+JSON.stringify(locs));
                for (var i in locs) {
                    var option = document.createElement("option");
                    option.text = locs[i];
                    option.value = locs[i];
                    if (document.getElementById(uiId)!=null) {
                        document.getElementById(uiId).appendChild(option);
                    } else {
                        ddLocs += "<option value=\""+locs[i]+"\">"+locs[i]+"</option>";
                    }
                }  
            }
        });
        dd += "</select>";
        return dd;
    },
    
    renderImageInBrowser: function(file,id) {
        if (this.notNullOrEmptyString(String(file))) {
            var reader = new FileReader();
            reader.onload = function(e) {
                console.log("Target ID for image render: #"+multipleSubmitUI.getImageIdForIndex(id));
                $('#'+multipleSubmitUI.getImageIdForIndex(id)).attr('src', e.target.result); // This is the target.. where we want the preview
            }
            reader.readAsDataURL(file);
        }
    },
    
    notNullOrEmptyString: function(entry) {
        if (entry==undefined||entry==""||!entry) return false;
        return true; 
    }, 

    encsDefined() {
        return document.getElementById('numberEncounters').value;
    }
    
};