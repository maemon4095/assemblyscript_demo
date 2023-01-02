// @ts-check
const common_style_element_id = 'tabbed-menu-common-style';
const tab_focused_attribute = 'data-tab-focus';
const tabbar_class = 'tabbed-menu-tabbar';
const tabbar_tab_class = 'tabbed-menu-tabbar-tab';
const tabname_attribute = 'data-tabname';
const tabbed_menu_class = 'tabbed-menu';
// @ts-ignore
define(() => {
    //@ts-check
    'use strict';

    class TabbedMenu extends EventTarget {
        /**
         * @param {TabCollection} tabs
         * @param {number} selectedIndex
         */
        constructor(tabs, selectedIndex) {
            super();
            tabs.addEventListener(TabInsertEvent.TYPE, this.#onInsert);
            tabs.addEventListener(TabRemoveEvent.TYPE, this.#onRemove);
            this.#tabs = tabs;
            this.#selectedIndex = selectedIndex;
        }

        /** @type {TabCollection} */
        #tabs;
        /** @type {number} */
        #selectedIndex;
        /** @returns {TabCollection} */
        get tabs() {
            return this.#tabs;
        }

        /** @returns {Tab | null} */
        get selected() {
            if (this.#selectedIndex < 0 || this.#selectedIndex >= this.#tabs.count) {
                return null;
            }
            return this.#tabs[this.#selectedIndex];
        }

        /** @param {number} index */
        select(index) {
            const old = this.selected;
            this.#selectedIndex = index >= this.#tabs.count ? -1 : index;
            this.dispatchEvent(new TabSelectEvent(this.selected, old));
        }

        clearSelect() {
            this.select(-1);
        }

        /** @param {Event} event */
        #onInsert(event) {
            const e = /** @type {TabInsertEvent} */(event);
            if (e.index <= this.#selectedIndex) {
                this.#selectedIndex += 1;
            }
            this.dispatchEvent(event);
        }
        /** @param {Event} event */
        #onRemove(event) {
            const e = /** @type {TabRemoveEvent} */(event);
            if (e.index === this.#selectedIndex) {
                this.#selectedIndex = -1;
            } else if (e.index < this.#selectedIndex) {
                this.#selectedIndex -= 1;
            }
            this.dispatchEvent(event);
        }
    }

    class TabCollection extends EventTarget {
        constructor() {
            super();
            this.#tabs = [];
        }

        /** @type {Array<Tab>} */
        #tabs;

        get count() {
            return this.#tabs.length;
        }

        /** @param {number} index */
        tab(index) {
            return this.#tabs[index];
        }

        /**
         * @param {number} index 
         * @param {Tab} tab 
         */
        insert(index, tab) {
            this.#tabs.splice(index, 0, tab);
            this.dispatchEvent(new TabInsertEvent(index, tab));
        }

        /**
         * @param {Tab} tab 
         */
        append(tab) {
            this.#tabs.push(tab);
            this.dispatchEvent(new TabInsertEvent(this.count - 1, tab));
        }

        /**
         * @param {number} index 
         */
        remove(index) {
            const tabs = this.#tabs;
            const removed = tabs[index];
            tabs.splice(index, 1);
            this.dispatchEvent(new TabRemoveEvent(index, removed));
        }
    }

    class Tab extends EventTarget {
        /**@type {Element | String} */
        #label;
        /** @type {Element | String} */
        #content;
        get label() {
            return this.#label;
        }
        set label(label) {
            const old = this.#label;
            this.#label = label;
            this.dispatchEvent(new TabLabelChangedEvent(label, old));
        }
        get content() {
            return this.#content;
        }
        set content(content) {
            const old = this.#content;
            this.#content = content;
            this.dispatchEvent(new TabContentChangedEvent(content, old));
        }
    }

    class TabSelectEvent extends Event {
        static get TYPE() {
            return 'tab-select'
        }
        #tab;
        #oldTab;

        /**
         * @param {Tab|null} tab
         * @param {Tab|null} oldTab
         */
        constructor(tab, oldTab) {
            super(TabSelectEvent.TYPE);
            this.#tab = tab;
            this.#oldTab = oldTab;
        }

        get tab() {
            return this.#tab;
        }
        get oldTab() {
            return this.#oldTab;
        }
    }

    class TabInsertEvent extends Event {
        static get TYPE() {
            return 'tab-insert';
        }

        /** @type {number} */
        #index;
        /** @type {Tab} */
        #tab;
        /**
         * @param {number} index 
         * @param {Tab} tab 
         */
        constructor(index, tab) {
            super(TabInsertEvent.TYPE);
            this.#index = index;
            this.#tab = tab;
        }
        get index() {
            return this.#index;
        }
        get tab() {
            return this.#tab;
        }
    }

    class TabRemoveEvent extends Event {
        static get TYPE() {
            return 'tab-remove';
        }

        #index;
        #removed;
        /**
         * @param {number} index
         * @param {Tab} removed
         */
        constructor(index, removed) {
            super(TabRemoveEvent.TYPE);
            this.#index = index;
            this.#removed = removed;
        }

        get index() {
            return this.#index;
        }

        get removed() {
            return this.#removed;
        }
    }

    class TabContentChangedEvent extends Event {
        static get TYPE() {
            return "tab-content-changed";
        }

        #oldContent;
        #content;

        /**
         * @param {Element | String} content
         * @param {Element | String} old
         */
        constructor(content, old) {
            super(TabContentChangedEvent.TYPE);
            this.#oldContent = old;
            this.#content = content;
        }

        get oldContent() {
            return this.#oldContent;
        }

        get content() {
            return this.#content;
        }
    }

    class TabLabelChangedEvent extends Event {
        static get TYPE() {
            return "tab-label-changed";
        }
        #oldLabel;
        #label;
        /**
         * @param {Element | String} label
         * @param {Element | String} old
         */
        constructor(label, old) {
            super(TabLabelChangedEvent.TYPE);
            this.#oldLabel = old;
            this.#label = label;
        }

        get oldLabel() {
            return this.#oldLabel;
        }
        get label() {
            return this.#label;
        }
    }


    /**
     * @param {Element} element 
     * @returns {TabbedMenu}
     */
    function create(element) {
        element.classList.add(tabbed_menu_class);

        return new TabbedMenu();
    }

    return {
        events: {
            TabSelectEvent,
            TabInsertEvent,
            TabRemoveEvent,
            TabContentChangedEvent,
            TabLabelChangedEvent,
        },
        TabbedMenu,
        TabCollection,
        Tab,
        create,
    };
});

// todo monacoライクな実装をする．
const targets = document.getElementsByClassName('tabbed-menu');
if (!document.getElementById(common_style_element_id)) {
    const style = document.createElement('style');
    style.id = common_style_element_id;
    style.innerHTML = `
    .tabbed-menu > :not(.${tabbar_class}) {
        display: none;
        grid-area: main;
    }
    .tabbed-menu > :not(.${tabbar_class})[${tab_focused_attribute}="focused"] {
        display: block;
    }
    `;

    document.head.append(style);
}

for (const target of targets) {
    initializeTarget(target);
}

function initializeTarget(rootElement) {


    rootElement.style.display = "grid";
    rootElement.style["grid-template"] = `"tabbar" auto\n"main" 1fr / 1fr`;

    const tabbar = document.createElement('div');
    tabbar.style['grid-area'] = "tabbar";
    tabbar.style['display'] = "flex";
    tabbar.classList.add(tabbar_class);

    const initializeTabbar = () => {
        tabbar.replaceChildren();
        const tabs = [...rootElement.children].filter(elem => !elem.classList.contains(tabbar_class));
        for (const tab of tabs) {
            const button = createTabButton(tab, tabs);
            tabbar.append(button);
        }
    };

    const onRootElementChanged = mutations => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            initializeTabbar();
        }
    };

    initializeTabbar();
    rootElement.append(tabbar);
    const rootElementObserver = new MutationObserver(onRootElementChanged);
    rootElementObserver.observe(rootElement, { childList: true });


    function createTabButton(tab, tabs) {
        const name = tab.getAttribute(tabname_attribute);
        const tabButton = document.createElement('button');
        const syncFocus = () => {
            const focus = tab.getAttribute(tab_focused_attribute);
            tabButton.setAttribute(tab_focused_attribute, focus);
            if (focus === 'focused') {
                for (const t of tabs) {
                    if (t === tab) {
                        continue;
                    }
                    t.setAttribute(tab_focused_attribute, 'none');
                }
            }
        };
        tabButton.className = tabbar_tab_class;
        tabButton.append(name);
        syncFocus();
        tabButton.addEventListener('click', () => {
            tab.setAttribute(tab_focused_attribute, 'focused');
        });

        const onTabAttributeChanged = (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== "attributes") {
                    continue;
                }
                syncFocus();
            }
        };
        const observer = new MutationObserver(onTabAttributeChanged);
        observer.observe(tab, { attributes: true });

        return tabButton;
    }
}

