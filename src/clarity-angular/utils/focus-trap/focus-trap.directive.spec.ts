/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import {Component, ViewChild} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

import {Modal} from "../../modal/modal";
import {ClrModalModule} from "../../modal/modal.module";

import {FocusTrapDirective} from "./focus-trap.directive";
import {ClrFocusTrapModule} from "./focus-trap.module";

describe("FocusTrap", () => {
    let fixture: ComponentFixture<any>;
    let compiled: any;
    let directive: FocusTrapDirective;

    describe("default behavior", () => {
        beforeEach(() => {
            TestBed.configureTestingModule({imports: [ClrFocusTrapModule], declarations: [TestComponent]});

            fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();

            compiled = fixture.nativeElement;

            directive = fixture.debugElement.query(By.directive(FocusTrapDirective)).injector.get(FocusTrapDirective);
        });

        afterEach(() => {
            fixture.destroy();
        });

        it("should create directive", () => {
            expect(directive).toBeTruthy();
        });

        it("should add tabindex attribute with value zero", () => {
            directive.ngAfterViewInit();
            const element: HTMLElement = directive.elementRef.nativeElement;
            expect(element.getAttribute("tabindex")).toEqual("0");
        });

        it(`should focus on trappable element when tab key
        is pressed and last input is active`,
           () => {

               const element = directive.elementRef.nativeElement;

               const lastInput = compiled.querySelector("#last");
               lastInput.focus();

               const tabEvent = {shiftKey: false, keyCode: 9, preventDefault: () => {}};

               directive.onFocusIn(tabEvent);

               expect(document.activeElement).toEqual(element);
           });
    });

    describe("clr-modal behavior", () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [FormsModule, NoopAnimationsModule, ClrModalModule, ClrFocusTrapModule],
                declarations: [TestModalComponent]
            });

            fixture = TestBed.createComponent(TestModalComponent);
            fixture.detectChanges();

            compiled = fixture.nativeElement;
        });

        afterEach(() => {
            fixture.destroy();
        });

        it("should have an activeElement that defaults to the body", () => {
            expect(document.body).toBe(document.activeElement);
        });

        it("should return focus to the activeElement at the time of its initialization", () => {
            const initialActiveElement: any = document.activeElement;
            const toggleButton: HTMLElement = compiled.querySelector("#toggleButton");
            // Show the modal
            toggleButton.click();
            fixture.detectChanges();

            // Put focus into the contactInfo input
            const contactInfo: HTMLElement = compiled.querySelector("#contactInfo");
            contactInfo.focus();
            expect(document.activeElement).toBe(contactInfo);

            // Use the escape key to close the modal
            const escEvent = {shiftKey: false, keyCode: 27, preventDefault: () => {}};
            fixture.componentInstance.modal.close(escEvent);
            fixture.detectChanges();
            expect(document.activeElement).toBe(initialActiveElement);
        });
    });
});

@Component({
    template: `
        <a href="#">Not in form</a>
        <form clrFocusTrap>
            <button id="first">
                Button to test first input
            </button>
            <input type="text" />
            <select>
                <option value="1">1</option>
                <option value="2">2</option>
            </select>
            <button id="last">
                Last Input
            </button>
        </form>
    `
})
class TestComponent {}

@Component({
    template: `
        <p>
            <button class="btn btn-primary" id="toggleButton" (click)="openState = true;">Show modal</button>
        </p>
        <clr-modal [(clrModalOpen)]="openState">
            <h3 class="modal-title">I have a nice title</h3>
            <div class="modal-body">
                <p>But not much to say...</p>
                <form class="form">
                    <section class="form-block">
                        <div class="form-group">
                            <label for="contactInfo">Contact Info</label>
                            <input type="text" id="contactInfo"
                                   [(ngModel)]="model.contactInfo"
                                   name="contactInfo">
                            <label for="contactInfo">Model Info: {{diagnostic}}</label>
                        </div>
                    </section>
                </form>
            </div>
        </clr-modal>`
})
class TestModalComponent {
    @ViewChild(Modal) modal: Modal;
    openState: boolean = false;
    model: any = {contactInfo: ""};
}
