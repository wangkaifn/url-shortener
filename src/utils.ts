import * as useragent from 'express-useragent';

export const getUseragentInfo = (UserAgent: string | 'unknown') => {
  if (UserAgent === 'unknown') return {};

  const ua = useragent.parse(UserAgent) as any;
  const browser = {
    Chrome: ua.isChrome,
    Firefox: ua.isFirefox,
    Safari: ua.isSafari,
    Edge: ua.isEdge,
    Opera: ua.isOpera,
    IE: ua.isIE,
    UC: ua.isUC,
    WeChat: ua.isWechat,
  };

  const os = {
    Android: ua.isAndroid,
    IOS: ua.isiPhone,
    Windows: ua.isWindows,
    Mac: ua.isMac,
    Linux: ua.isLinux,
  };

  const device = {
    Tablet: ua.isTablet,
    Mobile: ua.isMobile,
    Desktop: ua.isDesktop,
  };

  const getKeyWithValue = (obj: Record<string, boolean>) =>
    Object.keys(obj).find((key) => obj[key]) || 'Other';

  return {
    browser: getKeyWithValue(browser),
    os: getKeyWithValue(os),
    device: getKeyWithValue(device),
  };
};
