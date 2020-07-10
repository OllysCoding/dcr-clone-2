import React, { useState, useEffect } from 'react';
import { css, cx } from 'emotion';

import { textSans } from '@guardian/src-foundations/typography';
import { neutral } from '@guardian/src-foundations/palette';
import { palette } from '@guardian/src-foundations';
import { Button } from '@guardian/src-button';

import PlusIcon from '@frontend/static/icons/plus.svg';
import MinusIcon from '@frontend/static/icons/minus.svg';
import { Form } from '../Callout/Form';

const wrapperStyles = css`
    margin-bottom: 26px;
    margin-top: 16px;
`;

const calloutDetailsStyles = css`
    border-top: 1px ${neutral[86]} solid;
    border-bottom: 1px ${neutral[86]} solid;
    position: relative;
    padding-bottom: 10px;
`;

const backgroundColorStyle = css`
    background-color: ${neutral[97]};
`;

const speechBubbleWrapperStyles = css`
    margin-right: 10px;
`;

const successTextStyles = css`
    ${textSans.medium({ fontWeight: 'bold' })}
`;

const summeryStyles = css`
    /* Removing default styles from summery tag */
    ::-webkit-details-marker {
        display: none;
    }
    outline: none;
`;

const summeryContentWrapper = css`
    min-height: 70px;
    display: flex;
    flex-direction: row;
`;

const speechBubbleStyles = (pillar: Pillar) => css`
    ${textSans.medium({ fontWeight: 'bold' })}
    color: ${neutral[100]};
    background-color: ${palette[pillar][400]};
    min-width: 88px;
    padding-bottom: 6px;
    padding-left: 10px;
    padding-right: 10px;
    ::after {
        content: '';
        width: 20px;
        height: 22px;
        border-bottom-right-radius: 18px;
        position: absolute;
        background-color: ${palette[pillar][400]};
    }
`;

const headingTextHeaderStyles = css`
    ${textSans.medium({ fontWeight: 'bold' })}
`;

const headingTextStyles = css`
    a {
        color: ${palette.brand[500]};
        text-decoration: none;
        :hover {
            text-decoration: underline;
        }
    }
`;

const buttonWrapperStyles = css`
    position: absolute;
    cursor: pointer;
    margin-top: -5px;
`;

// Normally forms are in Modals, but here they are embeded into the page
// we therefore need to only focus on expandFormButtonRef if the form has been closed
// after it was opened
let hasFormBeenOpened = true;

type formData = { [key in string]: any };

export const CalloutBlockComponent = ({
    callout,
    pillar,
}: {
    callout: CalloutBlockElement;
    pillar: Pillar;
}) => {
    let expandFormButtonRef: HTMLButtonElement | null = null;
    let firstFieldElementRef: HTMLElement | null = null;
    let lastElementRef: HTMLButtonElement | null = null;

    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState('');
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    const { title, description, formFields } = callout;

    const onSubmit = async (formData: formData) => {
        // Reset error for new submission attempt
        setError('');

        if (formData.twitterHandle) {
            setError('Sorry we think you are a robot.');
            return;
        }
        // need to add prefix `field_` to all keys in form
        const formDataWithFieldPrefix = Object.keys(formData).reduce(
            (acc, cur) => ({
                ...acc,
                [`field_${cur}`]: formData[cur],
            }),
            {},
        );

        return fetch(callout.calloutsUrl, {
            method: 'POST',
            body: JSON.stringify({
                formId: callout.formId,
                // TODO: check if we need to send this
                'twitter-handle': '',
                ...formDataWithFieldPrefix,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
        })
            .then((resp) => {
                if (resp.status === 201) {
                    setSubmissionSuccess(true);
                    setIsExpanded(false);
                } else {
                    setError(
                        'Sorry, there was a problem submitting your form. Please try again later.',
                    );
                }
            })
            .catch((respError) => {
                window.guardian.modules.sentry.reportError(
                    respError,
                    'callout-embed-submission',
                );
                setError(
                    'Sorry, there was a problem submitting your form. Please try again later.',
                );
            });
    };

    // ***************************
    // *     Accessibility       *
    // ***************************
    useEffect(() => {
        // we have to use document.querySelector to find DOM elements
        // as Source library does not yet support react ref
        // TODO: use `useRef` once supported in Source

        // eslint-disable-next-line react-hooks/exhaustive-deps
        expandFormButtonRef = document.querySelector(
            'button[custom-guardian="callout-form-open-button"]',
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
        firstFieldElementRef = document.querySelector(`
            *[custom-guardian="callout-form-field"]:first-of-type input,
            *[custom-guardian="callout-form-field"]:first-of-type select
        `);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        lastElementRef = document.querySelector(
            'button[custom-guardian="callout-form-close-button"]',
        );

        // lock shift to the form
        const keyListener = (e: KeyboardEvent) => {
            // keyCode 9 is tab key
            if (e.keyCode === 9) {
                // If firstElement or lastElement are not defined, do not continue
                if (!firstFieldElementRef || !lastElementRef) return;

                // we use `e.shiftKey` internally to determin the direction of the highlighting
                // using document.activeElement and e.shiftKey we can check what should be the next element to be highlighted
                if (!e.shiftKey && document.activeElement === lastElementRef) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    firstFieldElementRef && firstFieldElementRef.focus();
                    e.preventDefault();
                }

                if (
                    e.shiftKey &&
                    document.activeElement === firstFieldElementRef
                ) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    lastElementRef && lastElementRef.focus(); // The shift key is down so loop focus back to the last item
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', keyListener);
        return () => document.removeEventListener('keydown', keyListener);
    }, [isExpanded]);

    // on open form, focus on firstFieldElementRef
    useEffect(() => {
        if (isExpanded && firstFieldElementRef) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            firstFieldElementRef && firstFieldElementRef.focus();
        }
    }, [isExpanded, firstFieldElementRef]);

    // on close form, focus on expandFormButtonRef
    useEffect(() => {
        if (!isExpanded && expandFormButtonRef && !hasFormBeenOpened) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expandFormButtonRef && expandFormButtonRef.focus();
        }
    }, [isExpanded, expandFormButtonRef]);

    // Normally forms are in Modals, but here they are embeded into the page
    // we therefore need to only focus on expandFormButtonRef if the form has been closed
    // after it was opened
    useEffect(() => {
        if (isExpanded) {
            hasFormBeenOpened = false;
        }
    }, [isExpanded]);

    // be able to close the form using the escape key for accessibility
    useEffect(() => {
        const keyListener = (e: KeyboardEvent) => {
            // keyCode 27 is the escape key, we want to be able to close the form using it
            if (e.keyCode === 27) {
                setIsExpanded(false);
            }
        };
        if (isExpanded) {
            document.addEventListener('keydown', keyListener);
        }
        return () => document.removeEventListener('keydown', keyListener);
    }, [isExpanded, setIsExpanded]);

    if (submissionSuccess) {
        return (
            <figure className={wrapperStyles}>
                <details
                    className={cx(calloutDetailsStyles, backgroundColorStyle)}
                    aria-hidden={true}
                    open={isExpanded}
                >
                    <summary
                        className={summeryStyles}
                        role="none"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                    >
                        <div className={summeryContentWrapper}>
                            <div className={speechBubbleWrapperStyles}>
                                <div className={speechBubbleStyles(pillar)}>
                                    <h4>Share your story</h4>
                                </div>
                            </div>
                            <div className={headingTextStyles}>
                                <p className={successTextStyles}>
                                    Thank you for your contribution
                                </p>
                            </div>
                        </div>
                    </summary>
                </details>
            </figure>
        );
    }

    return (
        <figure className={wrapperStyles}>
            <details
                className={cx(calloutDetailsStyles, {
                    [backgroundColorStyle]: isExpanded,
                })}
                aria-hidden={true}
                open={isExpanded}
            >
                <summary
                    className={summeryStyles}
                    role="none"
                    onClick={(event) => {
                        // We want to prevent the default `details` behavior from appearing
                        // expanding the details should only be done via the button
                        // however we still want links to be clickable
                        const target = event.target as HTMLElement;
                        if (target.tagName !== 'A') {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }}
                >
                    <div className={summeryContentWrapper}>
                        <div className={speechBubbleWrapperStyles}>
                            <div className={speechBubbleStyles(pillar)}>
                                <h4>Share your story</h4>
                            </div>
                        </div>
                        <div className={headingTextStyles}>
                            <h4 className={headingTextHeaderStyles}>{title}</h4>
                            {description && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: description,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {!isExpanded && (
                        <span
                            className={buttonWrapperStyles}
                            aria-hidden="true"
                        >
                            <Button
                                iconSide="left"
                                size="xsmall"
                                icon={<PlusIcon />}
                                onClick={() => setIsExpanded(true)}
                                custom-guardian="callout-form-open-button"
                            >
                                Tell us
                            </Button>
                        </span>
                    )}
                </summary>

                <Form
                    formFields={formFields}
                    onSubmit={onSubmit}
                    error={error}
                />

                <span className={buttonWrapperStyles} aria-hidden="true">
                    {isExpanded && (
                        <Button
                            iconSide="left"
                            size="xsmall"
                            icon={<MinusIcon />}
                            onClick={() => setIsExpanded(false)}
                            custom-guardian="callout-form-close-button"
                            // TODO: use ref once forwardRef is implemented @guardian/src-button
                            // ref={lastElement}
                        >
                            Hide
                        </Button>
                    )}
                </span>
            </details>
        </figure>
    );
};