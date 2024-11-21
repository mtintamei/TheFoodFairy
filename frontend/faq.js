        function toggleAnswer(element) {
            element.classList.toggle('active');
            const answer = element.nextElementSibling;
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        }

        document.getElementById('faqSearch').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const faqSections = document.querySelectorAll('.faq-section');
            
            faqSections.forEach(section => {
                const question = section.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = section.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });