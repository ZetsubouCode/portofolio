
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
			});
			
			// Close modal when clicking outside the content
			window.addEventListener('click', (event) => {
				if (event.target === modal) {
				modal.style.display = 'none';
				modalVideo.src = ''; // Stop the video
				}
			});

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
							<div class="portfolio-thumb" data-video="${project.link_video}">
							<img src="${project.photo}" class="img-responsive" alt="${project.name}">
							<div class="portfolio-overlay">
								<h4>${project.name}</h4>
								<h5>${project.description}</h5>
							</div>
							</div>
						</div>
						`;

						// Add click event for modal
						projectDiv.querySelector('.portfolio-thumb').addEventListener('click', (event) => {
							const videoURL = event.currentTarget.getAttribute('data-video');
							console.log(1111);
							console.log(videoURL);
							// Check if the URL is valid
							if (videoURL && videoURL.startsWith('https://www.youtube.com/embed/')) {
							  modal.style.display = 'block';
							  modalVideo.src = videoURL; // Set YouTube embed URL
							} else {
							  alert('No valid video available for this project.');
							}
						  });
						projectList.appendChild(projectDiv);
						console.log('Link Video from JSON:', project.link_video); // Check JSON content
						console.log('Set data-video:', projectDiv.querySelector('.portfolio-thumb').getAttribute('data-video')); // Check HTML attribute
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