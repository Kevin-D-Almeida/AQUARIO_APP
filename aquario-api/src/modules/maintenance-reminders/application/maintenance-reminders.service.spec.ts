import { isSameLocalCalendarDay } from './maintenance-reminders.service';

describe('isSameLocalCalendarDay', () => {
  it('aceita horários diferentes no mesmo dia local', () => {
    expect(
      isSameLocalCalendarDay(
        new Date('2026-07-19T04:30:00.000Z'),
        new Date('2026-07-20T03:59:00.000Z'),
        240,
      ),
    ).toBe(true);
  });

  it('recusa instantes que pertencem a dias locais diferentes', () => {
    expect(
      isSameLocalCalendarDay(
        new Date('2026-07-20T03:59:00.000Z'),
        new Date('2026-07-20T04:00:00.000Z'),
        240,
      ),
    ).toBe(false);
  });
});
