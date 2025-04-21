chrome.action.onClicked.addListener(async (tab) => {
    if (chrome.sidePanel) {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "src/ui/pages/panel.html",
        enabled: true
      });
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      console.warn("Side panel API not supported in this browser.");
    }
  });
  