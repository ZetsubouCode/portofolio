
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
			// Function to fetch and read the JSON file
			// fetch('../assets/data.json')
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
							<div class="portfolio-thumb">
								<img src="${project.photo}" class="img-responsive" alt="portfolio img">
								<div class="portfolio-overlay">
									<h4>${project.name}</h4>
									<h5>${project.description}</h5>
								</div>
							</div>
						</div>
						`;
						projectList.appendChild(projectDiv);
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