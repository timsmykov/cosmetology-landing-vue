(function registerPricingContent() {
  window.Landing = window.Landing || {};
  window.Landing.content = window.Landing.content || {};

  window.Landing.content.pricing = {
    title: 'Выберите свой формат участия',
    text: 'Найдите свой идеальный пакет, от быстрого старта до комплексной системы, чтобы масштабировать доход.',
    plans: [
      {
        anchorId: 'pricing-start',
        name: 'Старт',
        include: 'Включено: Вебинар 1, доступ к записи на 30 дней.',
        audience: 'Для кого: хочу попробовать и получить первый результат.',
        oldPrice: '3 490 ₽',
        newPrice: '2 990 ₽',
        action: 'Занять место',
        paymentUrl: 'https://secure.atolpay.ru/links/oJN4m5KWbjf6pXCR'
      },
      {
        anchorId: 'pricing-content-leads',
        name: 'Контент и заявки',
        include: 'Включено: Вебинар 1 + Вебинар 6 и поддержка спикеров и доступ к записям на 90 дней.',
        audience: 'Для кого: нужен не просто контент, а реальный доход.',
        oldPrice: '6 290 ₽',
        newPrice: '5 490 ₽',
        action: 'Занять место',
        paymentUrl: 'https://secure.atolpay.ru/links/QWXPeF0hPbQCnEw9'
      },
      {
        anchorId: 'pricing-full-package',
        name: 'Личный бренд под ключ',
        include: 'Включено: Вебинары 1–6, поддержка спикеров и доступ к записям на 180 дней.',
        audience: 'Для кого: кто хочет создать личный бренд и выжать из Instagram максимум',
        oldPrice: '14 990 ₽',
        newPrice: '13 490 ₽',
        action: 'Занять место',
        paymentUrl: 'https://secure.atolpay.ru/links/iOZeorUPAoNOIMPh'
      }
    ]
  };
})();
