(function registerPricingContent() {
  window.Landing = window.Landing || {};
  window.Landing.content = window.Landing.content || {};

  window.Landing.content.pricing = {
    title: 'Выберите свою модель обучения',
    text: 'Доступны два пакетных решения: быстрый результат (1+6) или полная система вебинаров 1–6.',
    plans: [
      {
        anchorId: 'pricing-content-leads',
        name: 'Пакет 1+6',
        include: 'Включено: Вебинар 1 + Вебинар 6, поддержка спикеров.',
        audience: 'Для кого: нужен не просто контент, а реальный доход.',
        oldPrice: '6 290 ₽',
        newPrice: '5 490 ₽',
        action: 'Занять место',
        paymentUrl: 'https://secure.atolpay.ru/links/QWXPeF0hPbQCnEw9'
      },
      {
        anchorId: 'pricing-full-package',
        name: 'Пакет 1–6',
        include: 'Включено: Вебинары 1–6, поддержка спикеров и доступ к записям вебинаров.',
        audience: 'Для кого: кто хочет создать личный бренд и выжать из Instagram максимум',
        oldPrice: '14 990 ₽',
        newPrice: '13 490 ₽',
        action: 'Занять место',
        paymentUrl: 'https://secure.atolpay.ru/links/iOZeorUPAoNOIMPh'
      }
    ]
  };
})();
