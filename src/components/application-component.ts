import { AmbiguousElementException, ConflictingInstructionsException, MissingElementException } from "../utilities/exceptions";
import BaseAnimation from "animations/base-animation";

type CreateElemAttributes = {
    appendAfter?: Element | null,
    appendBefore?: Element | null,
    appendTo?: Element | null,
    attributes?: Record<string, string | null>,
    children?: (Element | string)[],
    eventHandlers?: Partial<Record<keyof HTMLElementEventMap, EventListenerOrEventListenerObject>>,
    forceIndex?: string | undefined,
    isSvg?: Boolean,
    prependTo?: Element | null,
};

export default class ApplicationComponent {
    animations: BaseAnimation[]
    containingElem: Element;
    elemMap: Record<string, Element>;
    previousMs?: number
    props: Record<string, any>;

    // ==========================================================================
    constructor(containingElem: Element, props: object) {
        this.props = props;
        this.containingElem = containingElem;
        this.elemMap = {};
        this.animations = [];

        this.timeTick(0);
    }

    // ==========================================================================
    addAnimation(animation: BaseAnimation) {
        this.animations.push(animation);
        animation.setUp();
    }

    // ==========================================================================
    createElem(tagName: string, {
        appendAfter = null, appendBefore = null, appendTo = null, attributes = {}, children = [], eventHandlers = {},
        forceIndex = undefined, isSvg = false, prependTo = null
    }: CreateElemAttributes = {}): HTMLElement | SVGElement {
        const newElement = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", tagName) : document.createElement(tagName);
        Object.entries(attributes).forEach(([attrName, value]) => {
            if (attrName === "className") {
                attrName = "class";
            }
            if (value === null) {
                newElement.removeAttribute(attrName);
            } else {
                if (attrName === "className") {
                    newElement.setAttribute("class", value);
                } else {
                    newElement.setAttribute(attrName, value);
                }
            }
        });
        if (forceIndex) {
            if (!newElement.classList.contains(forceIndex)) {
                throw new MissingElementException(`${forceIndex} not in new element classList`);
            }
            if (this.elemMap[forceIndex]) {
                throw new AmbiguousElementException(`${forceIndex} already exists`);
            }
            this.elemMap[forceIndex] = newElement;
        }
        Object.entries(eventHandlers).forEach(eventToListenAndFunc => {
            const [ eventToListen, func ] = eventToListenAndFunc;
            newElement.addEventListener(eventToListen, func);
        });
        children.forEach(child => {
            if (typeof child === "string") {
                newElement.append(child);
            } else {
                newElement.appendChild(child);
            }
        });
        const locators = [ !!prependTo, !!appendAfter, !!appendBefore, !!appendTo ].filter(elem => elem).length;
        if (locators > 1) {
            throw new ConflictingInstructionsException(`Specified ${ locators } instructions to place element`)
        }
        if (prependTo) {
            prependTo.prepend(newElement);
        } else if (appendTo) {
            appendTo.appendChild(newElement);
        } else if (appendAfter) {
            appendAfter.parentNode!.insertBefore(newElement, appendAfter.nextSibling);
        } else if (appendBefore) {
            appendBefore.parentNode!.insertBefore(newElement, appendBefore);
        }
        return newElement;
    };

    // ==========================================================================
    createHtmlElem(tagName: string, {
        appendAfter = null, appendBefore = null, appendTo = null, attributes = {}, eventHandlers = {}, children = [], prependTo = null
    }: CreateElemAttributes = {}): HTMLElement {
        return this.createElem(tagName, { appendAfter, appendBefore, appendTo, attributes, eventHandlers: eventHandlers, isSvg: false, children, prependTo}) as HTMLElement;
    }

    // ==========================================================================
    createSvgElem(tagName: string, {
        appendAfter = null, appendBefore = null, appendTo = null, attributes = {}, eventHandlers = {}, children = [], prependTo = null
    }: CreateElemAttributes = {}): SVGElement {
        return this.createElem(tagName, { appendAfter, appendBefore, appendTo, attributes, eventHandlers: eventHandlers, isSvg: true, children, prependTo}) as SVGElement;
    }

    // ==========================================================================
    elem(className: string, ifNotPresent: CallableFunction | null = null): Element {
        if (!this.elemMap[className]) {
            const classElems = this.containingElem.getElementsByClassName(className);
            if (classElems.length === 0) {
                if (ifNotPresent) {
                    return ifNotPresent();
                }
                throw new MissingElementException(className);
            } else if (classElems.length > 1) {
                throw new AmbiguousElementException(className);
            }
            this.elemMap[className] = classElems[0];
        }
        return this.elemMap[className];
    }

    // ==========================================================================
    ensureElem(className: string, tagName: string, createElemAttributes: CreateElemAttributes = {}, setAttributesIfExists: boolean = true, replaceChildren = true): Element {
        try {
            const elem = this.elem(className);
            if (setAttributesIfExists && createElemAttributes.attributes) {
                Object.entries(createElemAttributes.attributes).forEach(([key, value]) => {
                    if (value !== null) {
                        elem.setAttribute(key, value);
                    } else {
                        elem.removeAttribute(key);
                    }
                });
            }
            if (replaceChildren && createElemAttributes.children) {
                elem.innerHTML = "";
                createElemAttributes.children.forEach(child => {
                    if (typeof child === "string") {
                        elem.append(child);
                    } else {
                        elem.appendChild(child);
                    }
                });
            }
            return elem;
        } catch(e) {
            if (!(e instanceof MissingElementException)) {
                throw e;
            }
            if (createElemAttributes.attributes) {
                createElemAttributes.attributes["className"] = className;
            } else {
                createElemAttributes.attributes = { className: className };
            }
            return this.createElem(tagName, createElemAttributes)
        }
    }

    // ==========================================================================
    elemExists(className: string): boolean {
        if (this.elemMap[className]) { return true; }
        const classElems = this.containingElem.getElementsByClassName(className);
        return classElems.length > 0;
    }

    // ==========================================================================
    ensureElemRemoved(className: string) {
        const classElems = this.containingElem.getElementsByClassName(className);
        while (classElems.length) {
            const classElem = classElems[0];
            if (classElem) {
                classElem.remove();
            } else {
                break;
            }
        }
        delete this.elemMap[className];
    }

    // ==========================================================================
    fontAwesomeElement(style: string, iconName: string, customClassName?: string): HTMLElement {
        const createElement = (): HTMLElement => {
            let className = `fa-${ style } fa-${ iconName }`;
            if (customClassName) {
                className += ` ${ customClassName }`;
            }
            return this.createElem("i", {
                attributes: { className: className }
            }) as HTMLElement;
        }
        if (customClassName) {
            return this.elem(customClassName, () => {
                return createElement();
            }) as HTMLElement;
        }
        return createElement();
    }

    // ==========================================================================
    runTimeSlice(dSeconds: number) {
        // Override
    }

    // ==========================================================================
    timeTick(ms: number) {
        if (ms && this.previousMs) {
            const dSeconds = (ms - this.previousMs) / 1000.0;
            const toRemove: BaseAnimation[] = [];
            this.animations.forEach(animation => {
                animation.addTime(dSeconds);
                if (animation.done) {
                    animation.completelyDestroy();
                    toRemove.push(animation);
                }
            });
            if (toRemove.length) {
                this.animations = this.animations.filter(animation => !toRemove.includes(animation));
            }
            this.runTimeSlice(dSeconds);
        }
        if (ms) {
            this.previousMs = ms;
        }
        requestAnimationFrame(this.timeTick.bind(this));
    }

    // ==========================================================================
    setElementAttributes(elem: Element, attributeMap: Record<string, string>) {
        Object.entries(attributeMap).forEach(([attr, value]) => {
            elem.setAttribute(attr, value);
        });
    }
}
