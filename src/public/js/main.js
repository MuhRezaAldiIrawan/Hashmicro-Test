// Auto-dismiss flash messages after 4 seconds
document.querySelectorAll('.flash').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity .4s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 4000);
});

// Radio option visual selection
document.querySelectorAll('.radio-option input[type=radio]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('radio-selected'));
    radio.closest('.radio-option').classList.add('radio-selected');
  });
});
