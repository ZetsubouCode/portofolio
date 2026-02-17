$(document).ready(function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wowInstance = typeof WOW === 'function' ? new WOW() : null;
    const documentElement = document.documentElement;
    const maxModalProjectJump = 1;
    let scrollAnimationFrame = null;
    let bodyPaddingRightSnapshot = '';
    let currentModalIndex = -1;
    let lastFocusedElement = null;

    if (wowInstance) {
        wowInstance.init();
    }

    if ($.fn.textrotator) {
        $('.rotate').textrotator();
    }

    // Disable legacy smoothscroll binding to prevent double scroll animation.
    $('a.smoothScroll').off('click');

    const cancelScrollAnimation = function() {
        if (scrollAnimationFrame) {
            cancelAnimationFrame(scrollAnimationFrame);
            scrollAnimationFrame = null;
        }
    };

    const easeInOutCubic = function(progress) {
        return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    };

    const animateWindowScroll = function(targetY, duration) {
        cancelScrollAnimation();

        if (prefersReducedMotion) {
            window.scrollTo(0, targetY);
            return;
        }

        const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const distance = targetY - startY;
        const animationDuration = duration || 900;

        if (Math.abs(distance) < 4) {
            window.scrollTo(0, targetY);
            return;
        }

        const startTime = performance.now();

        const step = function(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const easedProgress = easeInOutCubic(progress);
            const nextY = startY + distance * easedProgress;

            window.scrollTo(0, Math.round(nextY));

            if (progress < 1) {
                scrollAnimationFrame = requestAnimationFrame(step);
            } else {
                scrollAnimationFrame = null;
            }
        };

        scrollAnimationFrame = requestAnimationFrame(step);
    };

    window.addEventListener('wheel', cancelScrollAnimation, { passive: true });
    window.addEventListener('touchstart', cancelScrollAnimation, { passive: true });

    $(document).on('click', 'a.smoothScroll[href^="#"]', function(event) {
        const targetSelector = this.getAttribute('href');
        const targetElement = targetSelector ? document.querySelector(targetSelector) : null;

        if (!targetElement) {
            return;
        }

        event.preventDefault();
        const targetTop = Math.max(
            0,
            targetElement.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - 12
        );
        animateWindowScroll(targetTop, 950);

        if (history.replaceState) {
            history.replaceState(null, '', targetSelector);
        }
    });

    const initSectionTransitions = function() {
        const sections = Array.prototype.slice.call(document.querySelectorAll('#fullpage > .section'));
        if (!sections.length) {
            return;
        }

        if (prefersReducedMotion || typeof IntersectionObserver !== 'function') {
            sections.forEach(function(section) {
                section.classList.remove('is-hidden', 'is-leaving');
                section.classList.add('is-visible');
            });
            return;
        }

        document.body.classList.add('has-section-transitions');

        const setVisible = function(section) {
            section.classList.add('is-visible');
            section.classList.remove('is-hidden', 'is-leaving');
        };

        const setHidden = function(section) {
            section.classList.add('is-hidden');
            section.classList.remove('is-visible', 'is-leaving');
        };

        const setLeaving = function(section) {
            section.classList.add('is-leaving');
            section.classList.remove('is-visible', 'is-hidden');
        };

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        sections.forEach(function(section) {
            const rect = section.getBoundingClientRect();
            const visibleSize = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            const isInViewport = rect.bottom > 0 && rect.top < viewportHeight;
            const isSignificant = visibleSize > Math.max(120, rect.height * 0.2);
            if (isInViewport && isSignificant) {
                setVisible(section);
            } else {
                setHidden(section);
            }
        });

        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
                        setVisible(entry.target);
                        return;
                    }

                    if (entry.boundingClientRect.top < 0) {
                        setLeaving(entry.target);
                    } else {
                        setHidden(entry.target);
                    }
                });
            },
            {
                threshold: [0.15, 0.3, 0.6],
                rootMargin: '-8% 0px -8% 0px'
            }
        );

        sections.forEach(function(section) {
            observer.observe(section);
        });
    };

    initSectionTransitions();

    const modal = document.getElementById('projectModal');
    const modalVideo = document.getElementById('projectVideo');
    const modalImage = document.getElementById('modalImage');
    const closeModalButton = document.querySelector('.close');
    const projectDescription = document.getElementById('projectDescription');
    const githubLinkElement = document.getElementById('githubLink');
    const projectList = document.getElementById('project-list');
    const whatIDo = document.getElementById('what-i-do');
    const fallbackImage = 'images/video-not-found.jpg';

    const getProjectThumbs = function() {
        if (!projectList) {
            return [];
        }

        return Array.prototype.slice.call(projectList.querySelectorAll('.portfolio-thumb[data-project-index]'));
    };

    const getModalFocusableElements = function() {
        if (!modal) {
            return [];
        }

        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.prototype.slice.call(modal.querySelectorAll(selectors.join(','))).filter(function(element) {
            return element.offsetParent !== null;
        });
    };

    const lockBodyScroll = function() {
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
        bodyPaddingRightSnapshot = document.body.style.paddingRight;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
        }
        document.body.classList.add('modal-open');
    };

    const unlockBodyScroll = function() {
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = bodyPaddingRightSnapshot;
        bodyPaddingRightSnapshot = '';
    };

    const closeModal = function() {
        if (!modal) {
            return;
        }

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        unlockBodyScroll();

        if (modalVideo) {
            modalVideo.src = '';
        }

        if (modalImage) {
            modalImage.src = '';
            modalImage.style.display = 'none';
        }

        currentModalIndex = -1;

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    };

    const openModal = function(videoUrl, description, githubLink, sourceElement, projectIndex) {
        if (!modal || !modalVideo || !modalImage) {
            return;
        }

        const alreadyOpen = modal.classList.contains('is-open');
        const isYoutubeEmbed = typeof videoUrl === 'string' && videoUrl.indexOf('https://www.youtube.com/embed/') === 0;

        if (isYoutubeEmbed) {
            modalVideo.style.display = 'block';
            modalImage.style.display = 'none';
            modalVideo.src = videoUrl;
        } else {
            modalVideo.style.display = 'none';
            modalVideo.src = '';
            modalImage.style.display = 'block';
            modalImage.src = fallbackImage;
        }

        if (projectDescription) {
            projectDescription.textContent = description || 'No description available for this project.';
        }

        if (githubLinkElement) {
            if (githubLink) {
                githubLinkElement.href = githubLink;
                githubLinkElement.style.display = 'inline-flex';
            } else {
                githubLinkElement.style.display = 'none';
            }
        }

        if (!alreadyOpen) {
            lastFocusedElement = sourceElement || document.activeElement;
        }

        if (typeof projectIndex === 'number' && !Number.isNaN(projectIndex)) {
            currentModalIndex = projectIndex;
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        if (!alreadyOpen) {
            lockBodyScroll();
        }

        if (closeModalButton && typeof closeModalButton.focus === 'function') {
            closeModalButton.focus();
        }
    };

    const navigateModalProject = function(step) {
        const thumbs = getProjectThumbs();

        if (!thumbs.length || currentModalIndex < 0) {
            return;
        }

        const normalizedStep = Math.max(-maxModalProjectJump, Math.min(maxModalProjectJump, step));
        const nextIndex = (currentModalIndex + normalizedStep + thumbs.length) % thumbs.length;
        const nextThumb = thumbs[nextIndex];

        openModal(
            nextThumb.getAttribute('data-video'),
            nextThumb.getAttribute('data-desc'),
            nextThumb.getAttribute('data-url'),
            lastFocusedElement,
            nextIndex
        );
    };

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
        closeModalButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                closeModal();
            }
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (!modal || !modal.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key === 'Tab') {
            const focusableElements = getModalFocusableElements();
            if (!focusableElements.length) {
                event.preventDefault();
                return;
            }

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateModalProject(1);
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateModalProject(-1);
        }
    });

    const createWorkCard = function(item) {
        const workItem = document.createElement('div');
        workItem.className = 'work-item dynamic-item';

        const media = document.createElement('article');
        media.className = 'media';

        const mediaObject = document.createElement('div');
        mediaObject.className = 'media-object media-left';

        const icon = document.createElement('i');
        icon.className = item.icon || 'fa fa-code';
        mediaObject.appendChild(icon);

        const mediaBody = document.createElement('div');
        mediaBody.className = 'media-body';

        const heading = document.createElement('h3');
        heading.className = 'media-heading';
        heading.textContent = item.title || 'Service';

        const description = document.createElement('p');
        description.textContent = item.description || '';

        mediaBody.appendChild(heading);
        mediaBody.appendChild(description);
        media.appendChild(mediaObject);
        media.appendChild(mediaBody);
        workItem.appendChild(media);

        return workItem;
    };

    const createProjectCard = function(project, index) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item dynamic-item';

        const thumb = document.createElement('article');
        thumb.className = 'portfolio-thumb';
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('aria-label', 'Open project details: ' + (project.name || 'Project'));
        thumb.setAttribute('data-project-index', String(index));
        thumb.setAttribute('data-video', project.link_video || '');
        thumb.setAttribute('data-desc', project.description || '');
        thumb.setAttribute('data-url', project.link_url_project || '');

        const image = document.createElement('img');
        image.className = 'img-responsive';
        image.src = project.photo || fallbackImage;
        image.alt = project.name || 'Project thumbnail';
        image.loading = 'lazy';
        image.decoding = 'async';

        const overlay = document.createElement('div');
        overlay.className = 'portfolio-overlay';

        const title = document.createElement('h3');
        title.textContent = project.name || 'Untitled Project';

        overlay.appendChild(title);
        thumb.appendChild(image);
        thumb.appendChild(overlay);
        projectItem.appendChild(thumb);

        const handleOpen = function() {
            const parsedIndex = Number(thumb.getAttribute('data-project-index'));
            openModal(
                thumb.getAttribute('data-video'),
                thumb.getAttribute('data-desc'),
                thumb.getAttribute('data-url'),
                thumb,
                parsedIndex
            );
        };

        thumb.addEventListener('click', handleOpen);
        thumb.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpen();
            }
        });

        return projectItem;
    };

    const createServiceSkeleton = function() {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'work-item skeleton-item';

        const skeletonMedia = document.createElement('article');
        skeletonMedia.className = 'media media-skeleton';
        skeletonMedia.setAttribute('aria-hidden', 'true');

        const mediaObject = document.createElement('div');
        mediaObject.className = 'media-object media-left';

        const skeletonIcon = document.createElement('span');
        skeletonIcon.className = 'skeleton-circle';

        const mediaBody = document.createElement('div');
        mediaBody.className = 'media-body';

        const lineStrong = document.createElement('span');
        lineStrong.className = 'skeleton-line skeleton-line-strong';

        const lineNormal = document.createElement('span');
        lineNormal.className = 'skeleton-line';

        const lineShort = document.createElement('span');
        lineShort.className = 'skeleton-line skeleton-line-short';

        mediaObject.appendChild(skeletonIcon);
        mediaBody.appendChild(lineStrong);
        mediaBody.appendChild(lineNormal);
        mediaBody.appendChild(lineShort);
        skeletonMedia.appendChild(mediaObject);
        skeletonMedia.appendChild(mediaBody);
        skeletonItem.appendChild(skeletonMedia);

        return skeletonItem;
    };

    const createProjectSkeleton = function() {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'project-item skeleton-item';

        const skeletonThumb = document.createElement('article');
        skeletonThumb.className = 'portfolio-thumb project-skeleton';
        skeletonThumb.setAttribute('aria-hidden', 'true');

        const skeletonBlock = document.createElement('span');
        skeletonBlock.className = 'skeleton-block';

        skeletonThumb.appendChild(skeletonBlock);
        skeletonItem.appendChild(skeletonThumb);

        return skeletonItem;
    };

    const createStatePanel = function(message, onRetry) {
        const statePanel = document.createElement('div');
        statePanel.className = 'content-state';

        const stateText = document.createElement('p');
        stateText.className = 'content-state-text';
        stateText.textContent = message;
        statePanel.appendChild(stateText);

        if (typeof onRetry === 'function') {
            const retryButton = document.createElement('button');
            retryButton.type = 'button';
            retryButton.className = 'content-state-action';
            retryButton.textContent = 'Try again';
            retryButton.addEventListener('click', onRetry);
            statePanel.appendChild(retryButton);
        }

        return statePanel;
    };

    const revealItems = function(items, baseDelay) {
        if (!items.length) {
            return;
        }

        const delayStart = baseDelay || 0;
        items.forEach(function(item, index) {
            const delay = prefersReducedMotion ? 0 : delayStart + Math.min(index, 8) * 45;
            item.style.setProperty('--item-delay', delay + 'ms');
        });

        requestAnimationFrame(function() {
            items.forEach(function(item) {
                item.classList.add('is-ready');
            });
        });
    };

    const renderLoadingState = function() {
        if (!projectList || !whatIDo) {
            return;
        }

        whatIDo.setAttribute('aria-busy', 'true');
        projectList.setAttribute('aria-busy', 'true');
        whatIDo.innerHTML = '';
        projectList.innerHTML = '';

        for (let i = 0; i < 3; i += 1) {
            whatIDo.appendChild(createServiceSkeleton());
        }

        for (let i = 0; i < 6; i += 1) {
            projectList.appendChild(createProjectSkeleton());
        }
    };

    const renderErrorState = function(message, retryHandler) {
        if (!projectList || !whatIDo) {
            return;
        }

        whatIDo.removeAttribute('aria-busy');
        projectList.removeAttribute('aria-busy');
        whatIDo.innerHTML = '';
        projectList.innerHTML = '';

        whatIDo.appendChild(createStatePanel(message, retryHandler));
        projectList.appendChild(createStatePanel(message, retryHandler));
    };

    const renderPortfolioData = function(data) {
        if (!projectList || !whatIDo) {
            return;
        }

        const services = Array.isArray(data.what_i_do) ? data.what_i_do : [];
        const projects = Array.isArray(data.projects) ? data.projects : [];

        whatIDo.removeAttribute('aria-busy');
        projectList.removeAttribute('aria-busy');
        whatIDo.innerHTML = '';
        projectList.innerHTML = '';

        const serviceCards = services.map(function(item) {
            return createWorkCard(item);
        });
        const projectCards = projects.map(function(project, index) {
            return createProjectCard(project, index);
        });

        if (serviceCards.length) {
            serviceCards.forEach(function(card) {
                whatIDo.appendChild(card);
            });
            revealItems(serviceCards, 10);
        } else {
            whatIDo.appendChild(createStatePanel('Service details will be updated soon.'));
        }

        if (projectCards.length) {
            projectCards.forEach(function(card) {
                projectList.appendChild(card);
            });
            revealItems(projectCards, 80);
        } else {
            projectList.appendChild(createStatePanel('Project showcase is being updated.'));
        }

        if (wowInstance && typeof wowInstance.sync === 'function') {
            wowInstance.sync();
        }
    };

    const fetchPortfolioData = async function() {
        const endpoints = window.location.protocol === 'file:'
            ? [
                'https://zetsuboucode.github.io/portofolio/assets/data.json',
                'assets/data.json'
            ]
            : [
                'assets/data.json',
                'https://zetsuboucode.github.io/portofolio/assets/data.json'
            ];

        let lastError = null;

        for (let i = 0; i < endpoints.length; i += 1) {
            const controller = typeof AbortController === 'function' ? new AbortController() : null;
            const timeoutId = controller
                ? window.setTimeout(function() {
                    controller.abort();
                }, 8000)
                : null;

            try {
                const response = await fetch(endpoints[i], {
                    cache: 'no-store',
                    signal: controller ? controller.signal : undefined
                });
                if (!response.ok) {
                    throw new Error('Failed to load data from ' + endpoints[i]);
                }
                return await response.json();
            } catch (error) {
                lastError = error;
            } finally {
                if (timeoutId !== null) {
                    window.clearTimeout(timeoutId);
                }
            }
        }

        throw lastError || new Error('No data source available');
    };

    const loadPortfolioData = function() {
        if (!projectList || !whatIDo) {
            return;
        }

        renderLoadingState();

        fetchPortfolioData()
            .then(function(data) {
                renderPortfolioData(data);
            })
            .catch(function(error) {
                console.error('Error loading portfolio data:', error);
                renderErrorState('Unable to load portfolio data right now.', loadPortfolioData);
            });
    };

    loadPortfolioData();
});
