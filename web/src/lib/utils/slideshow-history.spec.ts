import { SlideshowHistory } from '$lib/utils/slideshow-history';

describe('SlideshowHistory', () => {
  const asset = (id: string) => ({ id });

  it('should not move in either direction when nothing has been queued', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);

    expect(history.next()).toBe(false);
    expect(history.previous()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not move in either direction after a reset', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));
    history.queue(asset('b'));

    history.reset();

    expect(history.next()).toBe(false);
    expect(history.previous()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not move with only one queued asset', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));

    expect(history.next()).toBe(false);
    expect(history.previous()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should sit on the newest asset, so there is nothing to move forward to', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));
    history.queue(asset('b'));

    expect(history.next()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should walk backwards through queued assets and stop at the oldest', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));
    history.queue(asset('b'));

    expect(history.previous()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(asset('a'));

    expect(history.previous()).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should walk forwards again after moving backwards', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));
    history.queue(asset('b'));
    history.queue(asset('c'));

    expect(history.previous()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(asset('b'));
    expect(history.previous()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(asset('a'));
    expect(history.previous()).toBe(false);

    expect(history.next()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(asset('b'));
  });

  it('should drop previously queued assets on reset', () => {
    const onChange = vi.fn();
    const history = new SlideshowHistory(onChange);
    history.queue(asset('a'));
    history.queue(asset('b'));

    history.reset();
    history.queue(asset('c'));
    history.queue(asset('d'));

    expect(history.previous()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(asset('c'));
    expect(history.previous()).toBe(false);
  });
});
