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
        include: 'Включено: Вебинар 1',
        audience: 'Для кого: хочу попробовать и получить первый результат.',
        oldPrice: '',
        newPrice: '2 990 ₽',
        action: 'Купить Вебинар 1',
        paymentUrl: 'https://secure.atolpay.ru/links/oJN4m5KWbjf6pXCR'
      },
      {
        anchorId: 'pricing-content-leads',
        name: 'Контент и заявки',
        include: 'Включено: Вебинар 1 + Вебинар 6, поддержка спикеров.',
        audience: 'Для кого: нужен не просто контент, а реальный доход.',
        oldPrice: '',
        newPrice: '5 490 ₽',
        action: 'Купить пакет "Контент и заявки"',
        paymentUrl: 'https://secure.atolpay.ru/links/QWXPeF0hPbQCnEw9',
        recommended: true
      },
      {
        anchorId: 'pricing-full-package',
        name: 'Личный бренд под ключ',
        include: 'Включено: Вебинары 1–6, поддержка спикеров и доступ к записям вебинаров.',
        audience: 'Для кого: Для создания личного бренда «под ключ». Результат: Стратегия, упаковка и автоматизация. Вы получаете не просто навыки, а работающую бизнес-машину.',
        oldPrice: '',
        newPrice: '13 990 ₽',
        action: 'Купить полный пакет',
        paymentUrl: 'https://secure.atolpay.ru/links/iOZeorUPAoNOIMPh'
      }
    ],
    note: [
      'РАННИЙ НАБОР — цены действуют до 20 февраля, 23:59.',
      'Через неделю стоимость вырастет. Успейте зафиксировать текущую цену.',
      'Любой вебинар 2–5 можно купить отдельно. Расширяйте пакет в любой момент с перерасчётом.'
    ]
  };
})();
