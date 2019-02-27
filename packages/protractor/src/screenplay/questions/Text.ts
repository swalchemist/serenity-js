import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';
import { RelativeQuestion } from './Pick';
import { TargetNestedElement, TargetNestedElements } from './Target';

export class Text {

    static of(target: Question<ElementFinder> | ElementFinder):
        Question<Promise<string>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
    {
        return new TextOfSingleElement(target);
    }

    static ofAll(target: Question<ElementArrayFinder> | ElementArrayFinder):
        Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
    {
        return new TextOfMultipleElements(target);
    }
}

export class TextOfSingleElement
    implements RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    constructor(protected readonly target: Question<ElementFinder> | ElementFinder) {
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new TextOfSingleElement(new TargetNestedElement(parent, this.target));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return withAnswerOf(actor, this.target, elf => elf.getText() as any);
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}

export class TextOfMultipleElements
    implements RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
{
    constructor(protected readonly target: Question<ElementArrayFinder> | ElementArrayFinder) {
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new TextOfMultipleElements(new TargetNestedElements(parent, this.target));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {

        // protractor ignores type definitions for the ElementArrayFinder, hence the `any`
        // https://github.com/angular/protractor/blob/c3978ec166760ac07db01e700c4aaaa19d9b5c38/lib/element.ts#L92
        return withAnswerOf(actor, this.target, eaf => Promise.resolve(eaf.getText() as any) as Promise<string[]>);
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}
