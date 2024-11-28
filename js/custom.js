
//
$(document).ready(function() {
			$('#fullpage').fullpage({
				'verticalCentered': false,
				'scrollingSpeed': 600,
				'autoScrolling': false,
				'css3': true,
				'navigation': true,
				'navigationPosition': 'right',
			});
			
			const modal = document.getElementById('projectModal');
			const modalVideo = document.getElementById('projectVideo');
			const closeModal = document.querySelector('.close');
			
			// Close modal function
			closeModal.addEventListener('click', () => {
				modal.style.display = 'none';
				modalVideo.src = ''; // Stop the video
				modalImage.src = '';
			});
			
			// Close modal when clicking outside the content
			window.addEventListener('click', (event) => {
				if (event.target === modal) {
				modal.style.display = 'none';
				modalVideo.src = ''; // Stop the video
				}
			});

			// Adjust modal position on scroll and resize
			document.addEventListener('scroll', () => {
				if (modal.style.display === 'block') {
				adjustModalPosition();
				}
			});
			
			window.addEventListener('resize', () => {
				if (modal.style.display === 'block') {
				adjustModalPosition();
				}
			});
			function adjustModalPosition() {
				const modalContent = modal.querySelector('.modal-content');
				modalContent.style.top = `${window.scrollY + window.innerHeight / 2 - modalContent.offsetHeight / 2}px`;
			}
			function openModal(videoURL,description,githubLink) {
				const placeholderImage = 'https://zetsuboucode.github.io/portofolio/images/video-not-found.jpg'; // Replace with your fallback image path
			  
				if (videoURL && videoURL.startsWith('https://www.youtube.com/embed/')) {
				  modalVideo.style.display = 'block'; // Show the iframe
				  modalImage.style.display = 'none'; // Hide the image
				  modalVideo.src = videoURL; // Set the YouTube URL
				} else {
				  modalVideo.style.display = 'none'; // Hide the iframe
				  modalImage.style.display = 'block'; // Show the image
				  modalImage.src = placeholderImage; // Set the fallback image
				}

				const projectDescription = document.getElementById('projectDescription');
				projectDescription.textContent = description || 'No description available for this project.';

				// Populate the GitHub link
				const githubLinkElement = document.getElementById('githubLink');
				if (githubLink) {
					githubLinkElement.href = githubLink;
					githubLinkElement.style.display = 'inline-block'; 
				} else {
					githubLinkElement.style.display = 'none'; // Hide the link if it's not provided
				}
			  
				modal.style.display = 'block'; // Show the modal
				adjustModalPosition(); // Adjust modal position
			  }
			fetch('https://zetsuboucode.github.io/portofolio/assets/data.json')
				.then(response => response.json())
				.then(data => {
					// Loop through the 'projects' array in the JSON file
					const projectList = document.getElementById('project-list');
					const whatIDo = document.getElementById('what-i-do');
					

					data.what_i_do.forEach(what_i_do => {
						const whatIDoDiv = document.createElement('div');
						whatIDoDiv.innerHTML = 
						`<div class="col-md-4 col-xs-11 wow fadeInUp" data-wow-delay="0.6s">
							<div class="media">
								<div class="media-object media-left">
									<i class="${what_i_do.icon}"></i>
								</div>
								<div class="media-body">
									<h3 class="media-heading">${what_i_do.title}</h3>
									<p>${what_i_do.description}</p>
								</div>
							</div>
						</div>`;
						whatIDo.appendChild(whatIDoDiv);
					});
					data.projects.forEach(project => {
						const projectDiv = document.createElement('div');
						projectDiv.innerHTML = `
						<div class="col-md-4 col-xs-6 wow fadeIn" data-wow-delay="0.6s">
							<div class="portfolio-thumb" data-video="${project.link_video}" data-desc="${project.description}" data-url="${project.link_url_project}">
								<img src="${project.photo}" class="img-responsive" alt="${project.name}">
								<div class="portfolio-overlay">
									<h3>${project.name}</h3> <!-- Title only, made bigger with a new heading tag -->
								</div>
							</div>
						</div>
						`;
						projectList.appendChild(projectDiv);
					});
					document.querySelectorAll('.portfolio-thumb').forEach((thumb) => {
						thumb.addEventListener('click', (event) => {
						  const videoURL = event.currentTarget.getAttribute('data-video');
						  const description = event.currentTarget.getAttribute('data-desc');
						  const githubURL = event.currentTarget.getAttribute('data-url');
						  openModal(videoURL,description,githubURL);
						});
					  });
				})
				.catch(error => console.error('Error loading JSON:', error));

		});

		
		  

// wow
$(function()
{
    new WOW().init();
    $(".rotate").textrotator();
})