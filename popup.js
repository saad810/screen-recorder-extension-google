const main = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // if(tab[0].url && tab[0].url.startsWith)

    const tabId = tab[0].id;
    await chrome.scripting.executeScript({
        files: ['content.js'],
        target: { tabId: tabId },
    })
}

main();