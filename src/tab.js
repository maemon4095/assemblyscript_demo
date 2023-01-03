// @ts-check
const tab_focused_attribute = 'data-tab-focus';
const tabbar_class = 'tabbed-menu-tabbar';
const tab_label_class = 'tabbed-menu-tab-label';
const tab_content_class = 'tabbed-menu-tab-content';
const tab_label_attribute = 'data-tab-label';
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
            tabs.addEventListener(TabInsertEvent.TYPE, (e) => this.#onInsert(e));
            tabs.addEventListener(TabRemoveEvent.TYPE, (e) => this.#onRemove(e));
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
            return this.#tabs.tab(this.#selectedIndex);
        }

        get selectedIndex() {
            return this.#selectedIndex < 0 ? undefined : this.#selectedIndex;
        }

        /** @param {number} index */
        select(index) {
            const old = this.selected;
            const oldIndex = this.#selectedIndex;
            this.#selectedIndex = index >= this.#tabs.count ? -1 : index;
            this.dispatchEvent(new TabSelectEvent(this.selected, this.#selectedIndex, old, oldIndex));
        }

        clearSelect() {
            this.select(-1);
        }

        /** @param {Event} event */
        #onInsert(event) {
            const { index, tab } = /** @type {TabInsertEvent} */(event);
            if (index <= this.#selectedIndex) {
                this.#selectedIndex += 1;
            }
            this.dispatchEvent(new TabInsertEvent(index, tab));
        }
        /** @param {Event} event */
        #onRemove(event) {
            const { index, removed } = /** @type {TabRemoveEvent} */(event);
            if (index === this.#selectedIndex) {
                this.#selectedIndex = -1;
            } else if (index < this.#selectedIndex) {
                this.#selectedIndex -= 1;
            }
            this.dispatchEvent(new TabRemoveEvent(index, removed));
        }
    }


    class TabCollection extends EventTarget {
        /**
         * @param {Array<Tab>} [tabs]
         */
        constructor(tabs = []) {
            super();
            this.#tabs = tabs;
        }

        /** @type {Array<Tab>} */
        #tabs;

        [Symbol.iterator]() {
            return this.#tabs[Symbol.iterator]();
        }

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
        /**
         * @param {Element | String | null} label
         * @param {Element | null} content
         */
        constructor(label, content) {
            super();
            this.#label = label;
            this.#content = content;
        }

        /**@type {Element | String | null} */
        #label;
        /** @type {Element | null} */
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
        #index;
        #oldIndex;
        /**
         * @param {Tab | null} tab
         * @param {Tab | null} oldTab
         * @param {number} index
         * @param {number} oldIndex
         */
        constructor(tab, index, oldTab, oldIndex) {
            super(TabSelectEvent.TYPE);
            this.#tab = tab;
            this.#oldTab = oldTab;
            this.#index = index;
            this.#oldIndex = oldIndex;
        }

        get tab() {
            return this.#tab;
        }
        get index() {
            return this.#index;
        }
        get oldTab() {
            return this.#oldTab;
        }
        get oldIndex() {
            return this.#oldIndex;
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
         * @param {Element | null} content
         * @param {Element | null} old
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
         * @param {Element | String | null} label
         * @param {Element | String | null} old
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
     * @param {HTMLElement} element 
     * @param {{ collectChildren: boolean }} [options]
     * @returns {TabbedMenu}
     */
    function create(element, options = { collectChildren: false }) {
        const tabs = new TabCollection();
        let selected = -1;
        let index = 0;
        if (options.collectChildren) {
            for (const elem of element.children) {
                if (elem.getAttribute(tab_focused_attribute) === 'focused') {
                    selected = index;
                }
                tabs.append(new Tab(elem.getAttribute(tab_label_attribute), elem));
                index++;
            }
        } else {
            element.innerHTML = '';
        }
        const menu = new TabbedMenu(tabs, selected);

        element.innerHTML = '';
        element.classList.add(tabbed_menu_class);
        const tabbarEl = document.createElement('div');
        tabbarEl.classList.add(tabbar_class);
        element.append(tabbarEl);
        const contentEl = document.createElement('div');
        contentEl.classList.add(tab_content_class);
        element.append(contentEl);

        const onSelectedTabContentChanged = (/** @type {Element | null | undefined} */ content) => {
            contentEl.innerHTML = '';
            if (!content) return;
            contentEl.append(content);
        };

        const onTabInsert = (/** @type {number} */ index, /** @type {Tab} */ tab) => {
            const labelEl = document.createElement('div');
            labelEl.classList.add(tab_label_class);
            labelEl.addEventListener('click', () => {
                menu.select(index);
            });
            labelEl.append(tab.label ?? '');
            tabbarEl.insertBefore(labelEl, tabbarEl.children[index])
            tab.addEventListener(TabLabelChangedEvent.TYPE, e => {
                const { label } = /** @type {TabLabelChangedEvent} */ (e);
                labelEl.innerHTML = '';
                labelEl.append(label ?? '');
            });

            tab.addEventListener(TabContentChangedEvent.TYPE, e => {
                if (menu.selected !== tab) return;
                const { content, oldContent } = /** @type {TabContentChangedEvent} */ (e);
                onSelectedTabContentChanged(content);
            });
        };

        const onTabRemove = (/** @type {number} */ index, /** @type {Tab} */ removed) => {
            tabbarEl.removeChild(tabbarEl.children[index]);
            removed.removeEventListener(TabLabelChangedEvent.TYPE, null);
            removed.removeEventListener(TabContentChangedEvent.TYPE, null);
        };

        const onTabSelect = (/** @type {Tab | null} */ tab, /** @type {number | undefined} */ index, /** @type {number | undefined} */ oldIndex) => {
            tabbarEl.children[oldIndex ?? -1]?.setAttribute(tab_focused_attribute, 'none');
            tabbarEl.children[index ?? -1]?.setAttribute(tab_focused_attribute, 'focused');
            onSelectedTabContentChanged(tab?.content);
        };

        index = 0;
        for (const tab of menu.tabs) {
            console.log(tab);
            onTabInsert(index, tab);
            index++;
        }
        onTabSelect(menu.selected, menu.selectedIndex);

        menu.addEventListener(TabInsertEvent.TYPE, (e) => {
            const { index, tab } = /** @type {TabInsertEvent} */(e);
            onTabInsert(index, tab);
        });
        menu.addEventListener(TabRemoveEvent.TYPE, (e) => {
            const { index, removed } = /** @type {TabRemoveEvent} */(e);
            onTabRemove(index, removed);
        });
        menu.addEventListener(TabSelectEvent.TYPE, (e) => {
            const { tab, index, oldIndex } = /** @type {TabSelectEvent} */(e);
            onTabSelect(tab, index, oldIndex);
        });

        return menu;
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