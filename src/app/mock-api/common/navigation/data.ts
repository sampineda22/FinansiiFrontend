/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    /*{
        id   : 'app-roles',
        title: 'Roles',
        type : 'basic',
        icon : 'heroicons_solid:user-circle',
        link : '/app-roles'
    },*/
    {
        id   : 'app-bank-transfers',
        title: 'Transferencias Bancarias',
        type : 'basic',
        icon : 'heroicons_solid:currency-dollar',
        link : '/accounting/app-bank-transfers'
    },
    {
        id   : 'app-receipt-breakdown',
        title: 'Desglose Detalle de Recibos',
        type : 'basic',
        icon : 'heroicons_solid:newspaper',
        link : '/app-receipt-breakdown'
    }
    ,
    {
        id   : 'app-providers-report',
        title: 'Reporte de Antigüedad de Proveedores',
        type : 'basic',
        icon : 'heroicons_solid:user-group',
        link : '/accounting/app-providers-report'
    },
    {
        id   : 'app-certificate-deposit',
        title: 'Certificados de Depósito',
        type : 'basic',
        icon : 'heroicons_solid:ticket',
        link : '/accounting/app-certificate-deposit'
    },
    {
        id   : 'app-vend-payment-report',
        title: 'Reporte de Pagos a Proveedores',
        type : 'basic',
        icon : 'heroicons_solid:book-open',
        link : '/accounting/app-vend-payment-report'
    },
    {
        id   : 'app-accounting-configuration',
        title: 'Configuración Contable',
        type : 'basic',
        icon : 'heroicons_solid:cog',
        link : '/accounting/app-accounting-configuration'
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'landing',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/landing'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
