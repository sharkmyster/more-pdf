/* global PDFViewerApplication */
/* global PDFJSAnnotate */
/* global PDFJS */

//PDF Annotations. Highlight/strikethrough

// Unused vars
// var PAGE_HEIGHT;
// var UI = window.PDFJSAnnotate.UI;
// var NUM_PAGES = 0;

// var pdfWorker = window.pdfjsDistBuildPdf;
// window.PDFJS.workerSrc = pdfWorker;
window.PDFJSAnnotate = window.PDFAnnotate;

var renderedPages = {};

var RENDER_OPTIONS = {
    documentId: documentId,
    pdfDocument: null,
    scale: 1.33,
    rotate: 0,
};
var documentId = "";
var MyStoreAdapter;
var annotations = [];
var annotationsStr = "";
var highlights = "";

window.addEventListener("message", function (event) {
    console.log("Message received from the parent: " + event.data);
    switch (event.data) {
        case "loadAnnotations":
            loadAnnotations(event.data.docName, event.data.annotations);
            break;
        case "clearAnnotations":
            clearAnnotations();
            break;
        case "setHighlights":
            setHighlights(event.data.text);
            break;
        case "clearSelection":
            clearSelection();
            break;
        case "toggleClear":
            toggleClear();
            break;
        case "toggleYellow":
            toggleYellow();
            break;
        case "toggleGreen":
            toggleGreen();
            break;
        case "toggleRed":
            toggleRed();
            break;
        case "toggleBlue":
            toggleBlue();
            break;
        case "toggleStrikethrough":
            toggleStrikethrough();
            break;
        case "saveAnnotations":
            saveAnnotations();
            break;
        case "pdfFileName":
            event.source.postMessage(pdfFileName(), event.origin);
            break;
        default:
            break;
    }

    // console.log("Message received from the parent: " + event.data); // Message received from parent
});

function saveAnnotations() {
    let newVal = JSON.stringify(annotations);

    if (newVal === annotationsStr) {
        return;
    }

    annotationsStr = newVal;

    if (typeof myextension != "undefined") {
        // TODO: replace with new API call
        // myextension.storeannotation(documentId, annotationsStr);
    }
}

function clearAnnotations() {
    annotations = [];
    for (var i = 0; i < PDFViewerApplication.pagesCount; i++) {
        renderAnnotations(i + 1);
    }
}

function loadAnnotations(docName, newAnnotations) {
    if (docName !== documentId) return false;

    annotations = JSON.parse(newAnnotations);
    for (var i = 0; i < PDFViewerApplication.pagesCount; i++) {
        renderAnnotations(i + 1);
    }
}

function setHighlights(text) {
    highlights += text;

    if (typeof myextension != "undefined") {
        // TODO: replace with new API call
        // myextension.highlightschanged(highlights);
    }
}

function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}

function toggleClear() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("highlight");
        a.handleDocumentMouseup({}, "transparent");
        a.disableRect();
        a.enableEdit();
    }
}

function toggleYellow() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("highlight");
        a.handleDocumentMouseup({}, "#ffff00");
        a.disableRect();
        a.enableEdit();
    }
}

function toggleGreen() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("highlight");
        a.handleDocumentMouseup({}, "#00ff00");
        a.disableRect();
        a.enableEdit();
    }
}

function toggleRed() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("highlight");
        a.handleDocumentMouseup({}, "#ffaeb9");
        a.disableRect();
        a.enableEdit();
    }
}

function toggleBlue() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("highlight");
        a.handleDocumentMouseup({}, "#42c0fb");
        a.disableRect();
        a.enableEdit();
    }
}

function toggleStrikethrough() {
    if (this.PDFJSAnnotate) {
        var a = this.PDFJSAnnotate.UI;
        a.disableEdit();
        a.enableRect("strikeout");
        a.handleDocumentMouseup({}, "#595959");
        a.disableRect();
        a.enableEdit();
    }
}

/*
 * create store to handle persistance and saving of pdf annotations
 * methods from https://github.com/instructure/pdf-annotate.js/blob/master/docs/api/StoreAdapter.md
 */
MyStoreAdapter = new PDFJSAnnotate.StoreAdapter({
    getAnnotations: function (documentId, pageNumber) {
        return new Promise(function (resolve) {
            var newAnnotations = annotations.filter(function (i) {
                return i.page === pageNumber && i.class === "Annotation";
            });

            resolve({
                documentId: documentId,
                pageNumber: pageNumber,
                annotations: newAnnotations,
            });
        });
    },

    getAnnotation: function (documentId, annotationId) {
        return Promise.resolve(
            annotations[findAnnotation(documentId, annotationId)]
        );
    },

    addAnnotation: function (documentId, pageNumber, annotation) {
        return new Promise(function (resolve) {
            annotation.class = "Annotation";
            annotation.uuid = uuid();
            annotation.page = pageNumber;

            annotations.push(annotation);

            resolve(annotation);
        });
    },

    editAnnotation: function (
        documentId,
        pageNumber,
        annotation,
        annotationId
    ) {
        return new Promise(function (resolve) {
            annotations[findAnnotation(documentId, annotationId)] = annotation;
            saveAnnotations();
            resolve(annotation);
        });
    },

    getComments: function (documentId, annotationId) {
        return new Promise(function (resolve) {
            resolve(
                annotations.filter(function (i) {
                    return (
                        i.class === "Comment" && i.annotation === annotationId
                    );
                })
            );
        });
    },

    deleteAnnotation: function (documentId, annotationId) {
        return new Promise(function (resolve) {
            var index = findAnnotation(documentId, annotationId);
            if (index > -1) {
                annotations.splice(index, 1);
                saveAnnotations();
            }

            resolve(true);
        });
    },

    addComment: function (documentId, annotationId, content) {
        return new Promise(function (resolve) {
            var comment = {
                class: "Comment",
                uuid: uuid(),
                annotation: annotationId,
                content: content,
            };

            annotations.push(comment);

            resolve(comment);
        });
    },

    deleteComment: function (documentId, commentId) {
        return new Promise(function (resolve) {
            _getAnnotations(documentId);
            var index = -1;
            for (var i = 0, l = annotations.length; i < l; i++) {
                if (annotations[i].uuid === commentId) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                annotations.splice(index, 1);
            }

            resolve(true);
        });
    },
});

function findAnnotation(documentId, annotationId) {
    var index = -1;
    for (var i = 0, l = annotations.length; i < l; i++) {
        if (annotations[i].uuid === annotationId) {
            index = i;
            break;
        }
    }
    return index;
}

PDFJSAnnotate.setStoreAdapter(MyStoreAdapter);

/**
 * Creates UIH Entry object for PDF seach & scaling user interactions
 * @param action
 * @param value
 */

/*
    function sendUserInteractionOnEvents(action, value) {
          var uihEntry = uih$.getObjInstance("pdfEntry");
          uihEntry.setAction(action);
          uihEntry.setValue(value);
          uih$.addUserInteractionEntry(uihEntry);
      }
*/

window.addEventListener(
    "scalechange",
    function (e) {
        /*if (e.presetValue == null || e.presetValue != "auto") {
                          sendUserInteractionOnEvents("pdfScale", (e.scale * 100) + "%")
                      }*/
        console.log("scalechange");
        setTimeout(function () {
            //scale changed, need to blow away previous rendered pages cache and rerender the svgs when revisited.
            RENDER_OPTIONS.scale = e.scale;
            renderedPages = {};
            renderAnnotations(PDFViewerApplication.page);
        });
    },
    false
);

function pdfFileName() {
    var appConfig = PDFViewerApplication.appConfig;
    var queryString = document.location.search.substring(1);
    var params = (0, parseQueryString)(queryString);
    var file = "file" in params ? params.file : appConfig.defaultUrl;
    return file;
}

function parseQueryString(query) {
    var parts = query.split("&");
    var params = Object.create(null);
    for (var i = 0, ii = parts.length; i < ii; ++i) {
        var param = parts[i].split("=");
        var key = param[0].toLowerCase();
        var value = param.length > 1 ? param[1] : null;
        params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return params;
}

function renderAnnotations(pageNumber) {
    // var visiblePage = document.querySelector(
    //     '.page[data-page-number="' + pageNumber + '"][data-loaded="true"]'
    // );
    // var loadedSVG = document.querySelector(
    //     '.page[data-page-number="' +
    //         pageNumber +
    //         '"] svg[data-pdf-annotate-container="true"]'
    // );

    //if (visiblePage) {
    // Prevent invoking UI.renderPage on the same page more than once.
    //if (!renderedPages[pageNumber] || !loadedSVG) {
    renderedPages[pageNumber] = true;
    if (RENDER_OPTIONS.pdfDocument) {
        PDFJSAnnotate.UI.renderPage(pageNumber, RENDER_OPTIONS);
        if (!isPreviousPageRendered(pageNumber)) {
            renderedPages[pageNumber - 1] = true;
            PDFJSAnnotate.UI.renderPage(pageNumber - 1, RENDER_OPTIONS);
        }
        if (!isNextPageRendered(pageNumber)) {
            renderedPages[pageNumber] = true;
            PDFJSAnnotate.UI.renderPage(pageNumber, RENDER_OPTIONS);
        }
    } else {
        setTimeout(function () {
            PDFJS.getDocument(pdfFileName()).then(function (pdf) {
                RENDER_OPTIONS.pdfDocument = pdf;
                RENDER_OPTIONS.documentId = pdfFileName();
                PDFJSAnnotate.UI.renderPage(pageNumber, RENDER_OPTIONS);
            });
        });
    }
    // }
    //}
}

function isPreviousPageRendered(pageNumber) {
    return pageNumber - 1 === 0 || renderedPages[pageNumber - 1];
}

function isNextPageRendered(pageNumber) {
    return (
        pageNumber + 1 <= RENDER_OPTIONS.pdfDocument.numPages &&
        renderedPages[pageNumber + 1]
    );
}

/*
 *   Create a UUID for each pdf annotation so it can be tracked
 */
var REGEXP = /[xy]/g;
var PATTERN = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

function replacement(c) {
    var r = (Math.random() * 16) | 0;
    var v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
}

function uuid() {
    return PATTERN.replace(REGEXP, replacement);
}
