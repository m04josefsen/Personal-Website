createButtonsForSubjects()

function createButtonsForSubjects() {
  const buttons = document.querySelectorAll('.tabs button');
  const sections = document.querySelectorAll('.subjects > div');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivates all buttons and sections
      buttons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      // Activate chosen button and section
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-target')).classList.add('active');
    });
  });
}