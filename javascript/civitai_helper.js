"use strict";


function getActivePrompt() {
    const currentTab = get_uiCurrentTabContent();
    switch (currentTab.id) {
        case "tab_txt2img":
            return currentTab.querySelector("#txt2img_prompt textarea");
        case "tab_img2img":
            return currentTab.querySelector("#img2img_prompt textarea");
    }
    return null;
}

function getActiveNegativePrompt() {
    const currentTab = get_uiCurrentTabContent();
    switch (currentTab.id) {
        case "tab_txt2img":
            return currentTab.querySelector("#txt2img_neg_prompt textarea");
        case "tab_img2img":
            return currentTab.querySelector("#img2img_neg_prompt textarea");
    }
    return null;
}


//button's click function
function open_model_url(event, model_type, model_name){
    console.log("start open_model_url");

    //get hidden components of extension 
    let js_msg_txtbox = gradioApp().querySelector("#ch_js_msg_txtbox textarea");
    let js_open_url_btn = gradioApp().getElementById("ch_js_open_url_btn");


    //msg to python side
    let msg = {
        "action": "",
        "model_type": "",
        "model_name": "",
        "prompt": "",
        "neg_prompt": "",
    }


    msg["action"] = "open_url";
    msg["model_type"] = model_type;
    msg["model_name"] = model_name;
    msg["prompt"] = "";
    msg["neg_prompt"] = "";

    // fill to msg box
    js_msg_txtbox.value = JSON.stringify(msg);
    js_msg_txtbox.dispatchEvent(new Event("input"));

    //click hidden button
    js_open_url_btn.click();

    console.log("end open_model_url");


    event.stopPropagation()
    event.preventDefault()

}

function add_trigger_words(event, model_type, model_name){
    console.log("start add_trigger_words");

    //get hidden components of extension 
    let js_msg_txtbox = gradioApp().querySelector("#ch_js_msg_txtbox textarea");
    let js_add_trigger_words_btn = gradioApp().getElementById("ch_js_add_trigger_words_btn");



    //msg to python side
    let msg = {
        "action": "",
        "model_type": "",
        "model_name": "",
        "prompt": "",
        "neg_prompt": "",
    }

    msg["action"] = "add_trigger_words";
    msg["model_type"] = model_type;
    msg["model_name"] = model_name;
    msg["neg_prompt"] = "";

    // get active prompt
    let prompt = getActivePrompt();
    msg["prompt"] = prompt.value;

    // fill to msg box
    js_msg_txtbox.value = JSON.stringify(msg);
    js_msg_txtbox.dispatchEvent(new Event("input"));

    //click hidden button
    js_add_trigger_words_btn.click();

    console.log("end add_trigger_words");

    event.stopPropagation()
    event.preventDefault()

    
}

function use_preview_prompt(event, model_type, model_name){
    console.log("start use_preview_prompt");

    //get hidden components of extension 
    let js_msg_txtbox = gradioApp().querySelector("#ch_js_msg_txtbox textarea");
    let js_use_preview_prompt_btn = gradioApp().getElementById("ch_js_use_preview_prompt_btn");



    //msg to python side
    let msg = {
        "action": "",
        "model_type": "",
        "model_name": "",
        "prompt": "",
        "neg_prompt": "",
    }

    msg["action"] = "use_preview_prompt";
    msg["model_type"] = model_type;
    msg["model_name"] = model_name;

    // get active prompt
    prompt = getActivePrompt();
    msg["prompt"] = prompt.value;

    // get active neg prompt
    let neg_prompt = getActiveNegativePrompt();
    msg["neg_prompt"] = neg_prompt.value;

    // fill to msg box
    js_msg_txtbox.value = JSON.stringify(msg);
    js_msg_txtbox.dispatchEvent(new Event("input"));

    //click hidden button
    js_use_preview_prompt_btn.click();

    console.log("end use_preview_prompt");

    event.stopPropagation()
    event.preventDefault()

}


onUiLoaded(() => {



    // get all extra network tabs
    let tab_prefix_list = ["txt2img", "img2img"];
    let model_type_list = ["textual_inversion", "hypernetworks", "checkpoints", "lora"];
    let cardid_suffix = "cards";

    // update extra network tab pages' cards
    // * replace "replace preview" text button into an icon
    // * add 3 button to each card:
    //  - open model url 🌐
    //  - add trigger words 💡
    //  - use preview image's prompt 🏷
    // notice: javascript can not get response from python side
    // so, these buttons just sent request to python
    // then, python side gonna open url and update prompt text box, without telling js side.
    function update_card_for_civitai(){


        //change all "replace preview" into an icon
        let extra_network_id = "";
        let extra_network_node = null;
        let addtional_nodes = null;
        let replace_preview_btn = null;
        let ul_node = null;
        let model_name_node = null;
        let model_name = "";
        let model_type = "";
        let cards = null;
        let need_to_add_buttons = false;
        for (const tab_prefix of tab_prefix_list) {
            for (const js_model_type of model_type_list) {
                //get model_type for python side
                switch (js_model_type) {
                    case "textual_inversion":
                        model_type = "ti";
                        break;
                    case "hypernetworks":
                        model_type = "hyper";
                        break;
                    case "checkpoints":
                        model_type = "ckp";
                        break;
                    case "lora":
                        model_type = "lora";
                        break;
                }

                if (!model_type) {
                    console.log("can not get model_type from: " + js_model_type);
                    continue;
                }

                extra_network_id = tab_prefix+"_"+js_model_type+"_"+cardid_suffix;
                // console.log("searching extra_network_node: " + extra_network_id);
                extra_network_node = gradioApp().getElementById(extra_network_id);
                if (!extra_network_node) {
                    console.log("can not find extra_network_node: " + extra_network_id);
                    continue;
                }
                // console.log("find extra_network_node: " + extra_network_id);

                // get all card nodes
                cards = extra_network_node.querySelectorAll(".card");
                for (let card of cards) {
                    // replace preview text button into icon
                    replace_preview_btn = card.querySelector(".actions .additional a");
                    if (replace_preview_btn) {
                        if (replace_preview_btn.innerHTML == "replace preview") {
                            need_to_add_buttons = true;
                            replace_preview_btn.innerHTML = "🖼";
                            replace_preview_btn.style.margin = "0px 5px";
                            replace_preview_btn.style.fontSize = "200%";
                        }
                    }

                    if (!need_to_add_buttons) {
                        continue;
                    }

                    //get model name node
                    model_name_node = card.querySelector(".actions .name");
                    if (!model_name_node){
                        console.log("can not find model name node for cards in " + extra_network_id);
                        continue;
                    }

                    // get model name
                    model_name = model_name_node.innerHTML;
                    if (!model_name) {
                        console.log("model name is empty for cards in " + extra_network_id);
                        continue;
                    }


                    //get ul node, which is the parent of all buttons
                    ul_node = card.querySelector(".actions .additional ul");

                    // then we need to add 3 buttons to each ul node:
                    let open_url_node = document.createElement("button");
                    open_url_node.innerHTML = "🌐";
                    open_url_node.style.fontSize = "200%";
                    open_url_node.title = "Open this model's civitai url";
                    open_url_node.style.margin = "0px 5px";
                    open_url_node.setAttribute("onclick","open_model_url(event, '"+model_type+"', '"+model_name+"')");

                    let add_trigger_words_node = document.createElement("button");
                    add_trigger_words_node.innerHTML = "💡";
                    add_trigger_words_node.style.fontSize = "200%";
                    add_trigger_words_node.title = "Add trigger words to prompt";
                    add_trigger_words_node.style.margin = "0px 5px";
                    add_trigger_words_node.setAttribute("onclick","add_trigger_words(event, '"+model_type+"', '"+model_name+"')");

                    let use_preview_prompt_node = document.createElement("button");
                    use_preview_prompt_node.innerHTML = "🏷";
                    use_preview_prompt_node.style.fontSize = "200%";
                    use_preview_prompt_node.title = "Use promt from preview image";
                    use_preview_prompt_node.style.margin = "0px 5px";
                    use_preview_prompt_node.setAttribute("onclick","use_preview_prompt(event, '"+model_type+"', '"+model_name+"')");

                    //add to card
                    ul_node.appendChild(open_url_node);
                    ul_node.appendChild(add_trigger_words_node);
                    ul_node.appendChild(use_preview_prompt_node);


                    
                    
                    


                }

                
            }
        }


    }

    //run it once
    update_card_for_civitai();

    let tab_id = ""
    let extra_tab = null;
    let extra_toolbar = null;
    //add refresh button to extra network's toolbar
    for (let prefix of tab_prefix_list) {
        tab_id = prefix + "_extra_tabs";
        extra_tab = gradioApp().getElementById(tab_id);

        //get toolbar
        extra_toolbar = extra_tab.querySelector("div.flex.border-b-2.flex-wrap");

        if (!extra_toolbar){
            console.log("can not get extra network toolbar for " + tab_id);
            continue;
        }

        // add refresh button to toolbar
        let ch_refresh = document.createElement("button");
        ch_refresh.innerHTML = "Refresh Civitai Helper";
        ch_refresh.title = "Refresh Civitai Helper's model card buttons";
        ch_refresh.className = "gr-button gr-button-lg gr-button-secondary";
        ch_refresh.onclick = update_card_for_civitai;

        extra_toolbar.appendChild(ch_refresh);

    }




});



