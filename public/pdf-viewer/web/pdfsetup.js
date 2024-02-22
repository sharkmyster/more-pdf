var disabledButtons = [
    "viewAttachments",
    "secondaryPresentationMode",
    "secondaryOpenFile",
    "secondaryPrint",
    "secondaryDownload",
    "secondaryViewBookmark",
    "presentationMode",
    "openFile",
    "print",
    "download",
    "viewBookmark",
    "documentProperties",
    // "pageRotateCw",
    // "pageRotateCcw",
    //"sidebarToggle",
    "spreadNone",
    "spreadOdd",
    "spreadEven",
    "scrollVertical",
    "scrollHorizontal",
    "scrollWrapped",
];

disabledButtons.map(function (item) {
    const el = document.getElementById(item);
    if (el) el.style.display = "none";
});
