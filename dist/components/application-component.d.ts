import BaseAnimation from "animations/base-animation";
type CreateElemAttributes = {
    appendAfter?: Element | null;
    appendBefore?: Element | null;
    appendTo?: Element | null;
    attributes?: Record<string, string | null>;
    children?: (Element | string)[];
    eventHandlers?: Partial<Record<keyof HTMLElementEventMap, EventListenerOrEventListenerObject>>;
    forceIndex?: string | undefined;
    isSvg?: Boolean;
    prependTo?: Element | null;
};
export default class ApplicationComponent {
    animations: BaseAnimation[];
    containingElem: Element;
    elemMap: Record<string, Element>;
    previousMs?: number;
    props: Record<string, any>;
    constructor(containingElem: Element, props: object);
    addAnimation(animation: BaseAnimation): void;
    createElem(tagName: string, { appendAfter, appendBefore, appendTo, attributes, children, eventHandlers, forceIndex, isSvg, prependTo }?: CreateElemAttributes): HTMLElement | SVGElement;
    createHtmlElem(tagName: string, { appendAfter, appendBefore, appendTo, attributes, eventHandlers, children, prependTo }?: CreateElemAttributes): HTMLElement;
    createSvgElem(tagName: string, { appendAfter, appendBefore, appendTo, attributes, eventHandlers, children, prependTo }?: CreateElemAttributes): SVGElement;
    elem(className: string, ifNotPresent?: CallableFunction | null): Element;
    ensureElem(className: string, tagName: string, createElemAttributes?: CreateElemAttributes, setAttributesIfExists?: boolean, replaceChildren?: boolean): Element;
    elemExists(className: string): boolean;
    ensureElemRemoved(className: string): void;
    fontAwesomeElement(style: string, iconName: string, customClassName?: string): HTMLElement;
    runTimeSlice(dSeconds: number): void;
    timeTick(ms: number): void;
    setElementAttributes(elem: Element, attributeMap: Record<string, string>): void;
}
export {};
//# sourceMappingURL=application-component.d.ts.map