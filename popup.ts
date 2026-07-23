import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class Modal implements OnDestroy {
    private firstFocus = true;
    private escapeKeySub?: Subscription;
    private backdropClickSub?: Subscription;
    private tabKeySub?: Subscription;
    private modalTimer$ = new Subject<{ id: string }>();
    modalShown$ = this.modalTimer$.asObservable();
    //  based modal open
    openModal(element: HTMLElement): void {
        const id = element.getAttribute('data-modal-target');
        if (id) {
            this.initModal(id);
        }
    }

    //  based modal open
    showModal(id: string): void {
        this.initModal(id.startsWith('#') ? id : '#' + id);

        // close button appear after 3 seconds
        setTimeout(() => {
            this.modalTimer$.next({ id });
        }, 45000);
    }

    // Modal initialization
    private initModal(id: string): void {
        if (!document.body.classList.contains('modal-open')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade';
            document.body.appendChild(backdrop);
        }
        document.body.classList.add('modal-open');

        const backdrop = document.querySelector(
            '.modal-backdrop'
        ) as HTMLElement;
        backdrop.classList.add('show');

        this.checkModalIsOpenOrNot();

        const activeModal = document.querySelector(id) as HTMLElement;
        if (!activeModal) return;

        activeModal.style.display = 'block';

        // Mobile device - modal align bottom
        setTimeout(() => {
            activeModal.classList.add('show');
            if (
                window.innerWidth <= 767 &&
                activeModal.classList.contains('modal-align-mobile-bottom')
            ) {
                activeModal.classList.add('modal-up-animate');
            }
        }, 300);

        // const modalEl = document.querySelector(id) as HTMLElement;
        // if (modalEl) {
        //     modalEl.classList.add('show');
        //     modalEl.style.display = 'block';
        // }

        this.setupBackdropCloseModalMobile();
        this.setupEscapeKeyCloseModal();
        this.setupTabKeyFocusHandling();
    }

    // Close modal
    closeModal(): void {
        this.firstFocus = true;
        this.checkModalIsOpenOrNot();

        const hideModal = document.querySelector(
            '.modal.fade.show'
        ) as HTMLElement | null;

        if (
            hideModal &&
            hideModal.classList.contains('modal-align-mobile-bottom')
        ) {
            if (window.innerWidth >= 768) {
                this.backdropTimeDelay(150, 250);
            } else {
                this.backdropTimeDelay(600, 650);
            }
        } else {
            this.backdropTimeDelay(150, 250);
        }

        // Clear video source if any
        const video = document.querySelector(
            '.modal-video-iframe'
        ) as HTMLIFrameElement | null;
        if (video) {
            video.src = '';
        }
    }

    // Check if the modal is already open or not
    private checkModalIsOpenOrNot(): void {
        const modalIsOpen = document.querySelector(
            '.modal.fade.show'
        ) as HTMLElement | null;
        const modalBody = document.querySelector(
            '.modal.show .modal-body'
        ) as HTMLElement | null;

        if (modalBody) {
            modalBody.scrollTo(0, 0);
        }

        if (modalIsOpen && modalIsOpen.style.display === 'block') {
            // Check if the model is align bottom or not
            if (modalIsOpen.classList.contains('modal-align-mobile-bottom')) {
                if (window.innerWidth >= 768) {
                    modalIsOpen.classList.remove('show');
                    setTimeout(() => {
                        modalIsOpen.style.display = 'none';
                    }, 100);
                } else {
                    modalIsOpen.classList.remove('modal-up-animate');
                    setTimeout(() => {
                        modalIsOpen.classList.remove('show');
                        modalIsOpen.style.display = 'none';
                    }, 1000);
                }
            } else {
                modalIsOpen.classList.remove('show');
                setTimeout(() => {
                    modalIsOpen.style.display = 'none';
                }, 100);
            }
        }
    }

    private backdropTimeDelay(timer1: number, timer2: number): void {
        setTimeout(() => {
            const backdrop = document.querySelector(
                '.modal-backdrop'
            ) as HTMLElement | null;
            if (backdrop) {
                backdrop.classList.remove('show');
                backdrop.remove();
            }
        }, timer1);

        setTimeout(() => {
            document.body.classList.remove('modal-open');
        }, timer2);
    }

    // Click Backdrop Overlay Close Modal
    private setupBackdropCloseModalMobile(): void {
        if (window.innerWidth <= 767) {
            const backdrop = document.querySelector(
                '.modal-backdrop'
            ) as HTMLElement | null;
            if (backdrop) {
                this.backdropClickSub?.unsubscribe();
                this.backdropClickSub = fromEvent(backdrop, 'click').subscribe(
                    () => this.closeModal()
                );
            }
        }
    }

    // Press Escape Key to Close Modal
    private setupEscapeKeyCloseModal(): void {
        this.escapeKeySub?.unsubscribe();
        this.escapeKeySub = fromEvent<KeyboardEvent>(
            document,
            'keydown'
        ).subscribe((event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    private setupTabKeyFocusHandling(): void {
        this.tabKeySub?.unsubscribe();
        this.tabKeySub = fromEvent<KeyboardEvent>(
            document,
            'keydown'
        ).subscribe((event) => {
            if (event.key !== 'Tab') return;

            const modal = document.querySelector('.modal.show');
            if (!modal) return;

            const focusableElements = modal.querySelectorAll<HTMLElement>(
                'input:not([disabled]), button:not([disabled]), select:not([disabled]), ' +
                    'textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const isShift = event.shiftKey;

            // Focus the first element only once
            if (this.firstFocus) {
                const initialFocus = modal.querySelector(
                    '.modal-close'
                ) as HTMLElement | null;
                if (initialFocus) {
                    initialFocus.focus();
                    this.firstFocus = false;
                    event.preventDefault();
                    return;
                }
            }

            // Trap focus inside the modal
            if (isShift && event.target === firstElement) {
                lastElement.focus();
                event.preventDefault();
            } else if (!isShift && event.target === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        });
    }

    ngOnDestroy(): void {
        this.escapeKeySub?.unsubscribe();
        this.backdropClickSub?.unsubscribe();
        this.tabKeySub?.unsubscribe();
    }
}
