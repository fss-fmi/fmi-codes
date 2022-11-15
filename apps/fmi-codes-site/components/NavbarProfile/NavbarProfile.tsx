import {Menu, Transition} from '@headlessui/react';
import React, {FC, Fragment} from 'react';
import styles from './NavbarProfile.module.scss';
import {usePathname} from 'next/navigation';
import Link from 'next/link';

const loginNavigation = [
  {name: 'Вход', href: '/login', isPrimary: false},
  {name: 'Регистрация', href: '/register', isPrimary: true},
];

const profileNavigation = [
  {name: 'Профил', href: '/profile'},
  {name: 'Създаване на отбор', href: '/teams/create'},
  {name: 'Изход', href: '/logout'},
];

const isUserLoggedIn = false; // TODO: Replace with real value

const NavbarProfile: FC = () => (
  <div className={styles.NavbarProfile}>
    {isUserLoggedIn ? <Menu as="div" className="relative ml-3">
      <Menu.Button
        className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <span className="sr-only">Отваряне на потребителскоте меню</span>
        <img
          className="h-8 w-8 rounded-full"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {profileNavigation.map((item) => (
            <div key={item.name}>
              <Menu.Item>
                {({active}) => (
                  <a
                    href="#"
                    className={(active ? 'bg-gray-100' : '') + 'block px-4 py-2 text-sm text-gray-700'}
                  >
                    {item.name}
                  </a>
                )}
              </Menu.Item>
            </div>
          ))}
        </Menu.Items>
      </Transition>
    </Menu> :
        <div className="flex space-x-2">
          {loginNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={(
                          item.href === usePathname() ?
                              'bg-gray-900 text-white' :
                              'text-gray-300 hover:bg-gray-700 hover:text-white') +
                          (item.isPrimary ? ' bg-purple-900' : '') +
                          ' px-3 py-2 rounded-md text-sm font-medium' }
              aria-current={item.href === usePathname() ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </div>
    }
  </div>
);

export default NavbarProfile;