import ProxyCore from './ProxyCore';

const singletonHolder: { core: ProxyCore | null } = { core: null };

export default singletonHolder;
