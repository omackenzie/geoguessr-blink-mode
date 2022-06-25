// ==UserScript==
// @name         Geoguessr Blink Mode
// @description  Shows the round briefly, then screen goes black and you have unlimited time to make your guess.
// @version      1.0.0
// @author       macca#8949
// @license      MIT
// @match        https://www.geoguessr.com/*
// @require      https://unpkg.com/@popperjs/core@2.11.5/dist/umd/popper.min.js
// @run-at       document-start
// @grant        none
// @namespace    https://greasyfork.org/en/scripts/438579-geoguessr-blink-mode
// ==/UserScript==

const guiEnabled = true
//                 ^^^^ Set to false (all lowercase) if you want to hide the GUI and manually enable the script/set the time, otherwise true

let timeLimit = 1.5
//              ^^^ Modify this number above to change the time



// --------- DON'T MODIFY ANYTHING BELOW THIS LINE -------- //



const guiHTML = `
<div class="section_sectionHeader__WQ7Xz section_sizeMedium__yPqLK"><div class="bars_root___G89E bars_center__vAqnw"><div class="bars_before__xAA7R bars_lengthLong__XyWLx"></div><span class="bars_content__UVGlL"><h3>Blink Mode settings</h3></span><div class="bars_after__Z1Rxt bars_lengthLong__XyWLx"></div></div></div>
<div class="start-standard-game_settings__x94PU">
  <div style="display: flex; justify-content: space-around;">
    <div style="display: flex; align-items: center;">
      <span class="game-options_optionLabel__dJ_Cy" style="margin: 0; padding-right: 6px;">Enabled</span>
      <input type="checkbox" id="enableScript" onclick="toggleBlinkMode(this)" class="toggle_toggle__hwnyw">
    </div>

    <div style="display: flex; align-items: center;">
      <span class="game-options_optionLabel__dJ_Cy" style="margin: 0; padding-right: 6px;">Time (Seconds)</span>
      <input type="text" id="blinkTime" onchange="changeBlinkTime(this)" style="background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 5px; width: 60px;">
    </div>
  </div>
  <p class="body-text_sizeXSmall__rwJFf" style="margin-top: 20px;">Ensure classic compass is enabled</p>
</div>
`

const guiHTMLHeader = `
<div id="blinkHeaderToggle" class="header_item__PyYsU">
  <div style="--icon-width:1rem;--addon-side-width:1.5625rem;--input-width:20rem;--section-height:3.125rem;--smooth-animation:0.4scubic-bezier(0.03,0.76,0.35,0.98);--border-style:0.0625remsolidvar(--ds-color-white-20);--total-width:calc(var(--icon-width)+var(--addon-side-width)+var(--input-width));--background-color:rgba(26,26,46,.95);align-items:center;display:flex;height:var(--section-height);position:relative;z-index:2;">
    <div id="popup" style="background: rgba(26, 26, 46, 0.9); padding: 15px; width: 200px; border-radius: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="game-options_optionLabel__dJ_Cy">Enabled</span>
        <input type="checkbox" id="enableScriptHeader" onclick="toggleBlinkMode(this)">
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span class="game-options_optionLabel__dJ_Cy">Time (Seconds)</span>
        <input type="text" id="blinkTimeHeader" onchange="changeBlinkTime(this)" style="background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 5px; width: 60px;">
      </div>
    </div>
    <picture class="quick-search_iconSection__aaqD2"><img id="headerGuiToggle" src="https://www.svgrepo.com/show/40039/eye.svg" style="filter: brightness(0) invert(1); opacity: 40%;"></picture>
  </div>
</div>
`


if (localStorage.getItem('blinkEnabled') == null) {
    localStorage.setItem('blinkEnabled', 'disabled');
}

if (!guiEnabled) {
    localStorage.setItem('blinkEnabled', 'enabled');
}

if (localStorage.getItem('blinkTime') == null || isNaN(localStorage.getItem('blinkTime'))) {
    localStorage.setItem('blinkTime', timeLimit);
}

if (guiEnabled) {
    timeLimit = localStorage.getItem('blinkTime');
}

window.toggleBlinkMode = (e) => {
    localStorage.setItem('blinkEnabled', e.checked ? 'enabled' : 'disabled');

    if (document.querySelector('#enableScript')) {
        document.querySelector('#enableScript').checked = e.checked;
    }
    if (document.querySelector('#enableScriptHeader')) {
        document.querySelector('#enableScriptHeader').checked = e.checked;
    }
}

window.changeBlinkTime = (e) => {
    if (!isNaN(e.value)) {
        localStorage.setItem('blinkTime', parseFloat(e.value));
        timeLimit = parseFloat(e.value);

        if (document.querySelector('#blinkTime')) {
            document.querySelector('#blinkTime').value = e.value;
        }
        if (document.querySelector('#blinkTimeHeader')) {
            document.querySelector('#blinkTimeHeader').value = e.value;
        }
    }
}

const checkInsertGui = () => {
    // Play page
    if (document.querySelector('.radio-box_root__ka_9S') && document.querySelector('#enableScript') === null) {
        document.querySelector('.section_sectionMedium__yXgE6').insertAdjacentHTML('beforeend', guiHTML);
        if (localStorage.getItem('blinkEnabled') === 'enabled') {
            document.querySelector('#enableScript').checked = true;
        }
        document.querySelector('#blinkTime').value = timeLimit;
    }

    // Header
    if (document.querySelector('.header_header__BxMhs') && document.querySelector('#blinkHeaderToggle') === null) {
        document.querySelector('.header_context__hzGGK').insertAdjacentHTML('afterbegin', guiHTMLHeader);
        const showButton = document.querySelector('#headerGuiToggle');
        const popup = document.querySelector('#popup');
        popup.style.display = 'none';

        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target == popup || popup.contains(target)) return;
            if (target == showButton) {
                e.preventDefault();

                popup.style.display = 'block';
                Popper.createPopper(showButton, popup, {
                  placement: 'bottom',
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 10],
                      },
                    },
                  ],
                });
            } else {
                popup.style.display = 'none';
            }

            if (localStorage.getItem('blinkEnabled') === 'enabled') {
                document.querySelector('#enableScriptHeader').checked = true;
            }
            document.querySelector('#blinkTimeHeader').value = timeLimit;
        });
    }
}

let previousTransform = '';

const onScreen = (element) => {
    let rect = element.getBoundingClientRect();
    let topElement = document.elementFromPoint(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
    if (element.isSameNode(topElement) & previousTransform != topElement.style.transform) {
        previousTransform = topElement.style.transform;
        return true;
    }
    return false;
}

let overlayAlreadyPresent = false;
function showWhenOverlayGone() {
    if (document.querySelector('.overlay_backdrop__Rh_QC')) {
        overlayAlreadyPresent = true;
        document.querySelector('.widget-scene-canvas').style.display = 'none';
        setTimeout(showWhenOverlayGone, 100);
    } else {
        overlayAlreadyPresent = false;
        document.querySelector('.widget-scene-canvas').style.display = 'block';
        setTimeout(() => {
            document.querySelector('.widget-scene-canvas').style.display = 'none';
        }, timeLimit * 1000);
    }
}

let observer = new MutationObserver((mutations) => {
    if (guiEnabled) {
        checkInsertGui();
    }

    if (localStorage.getItem('blinkEnabled') === 'enabled') {

        if (document.querySelector('.overlay_backdrop__Rh_QC') && !overlayAlreadyPresent) {
            showWhenOverlayGone()
        }

        if (document.querySelector('.compass__indicator')) {
            if (onScreen(document.querySelector('.compass__indicator'))) {
                setTimeout(() => {
                    document.querySelector('.widget-scene-canvas').style.display = 'none';
                }, timeLimit * 1000);
            }
        }
    }
});

observer.observe(document.body, {
  characterDataOldValue: false,
  subtree: true,
  childList: true,
  characterData: false
});
