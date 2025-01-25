'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Group, Image, Menu, Text, UnstyledButton } from '@mantine/core'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/app/UserProvider'
import { IconFileInfo, IconHammer, IconLogout, IconReportAnalytics, IconUpload } from '@tabler/icons-react'

const Title = () => (
  <Link href='/'>
    Voting Web App
  </Link>
)

const NavLink = ({
  href,
  label,
  isActive,
}: {
  href: string
  label: string
  isActive: boolean
}) => (
  <Link
    href={`${href}`}
    className={`hover:opacity-100 ${isActive ? 'opacity-100' : 'opacity-50'}`}
  >
    {label}
  </Link>
)

const NavBar = () => {

  interface NavLink {
    href: string;
    label: string;
  }

  const pathname = usePathname();
  const [user, auth] = useContext(UserContext);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  const logout = () => {
    localStorage.removeItem('access_token');
    auth();
  }

  useEffect(() => {
    const navLinks: NavLink[] = [];
    if (user) {
      navLinks.push(...[
      ]);
    }
    setNavLinks(navLinks);
  }, [user]);

  return (
    <nav className="sticky top-0 z-[100]  p-0 w-screen bg-white border-b-border border-b-2">
      <div className="container max-w-5xl mx-auto flex justify-between items-center py-4 px-4 lg:px-0">
        <div className="flex items-center gap-4">
          <Title />
        </div>
        <div className="flex space-x-8 px-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}
          {user ?
            <>
              <Menu trigger='click-hover' openDelay={100} closeDelay={400}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group>
                      <IconHammer></IconHammer>
                      <Text>Admin</Text>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconUpload></IconUpload>} component='a' href='/admin/upload'>
                    Upload Voting Forms and User List
                  </Menu.Item>
                  <Menu.Item leftSection={<IconReportAnalytics></IconReportAnalytics>} component='a' href='/admin/results'>
                    View Results
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item leftSection={<IconFileInfo></IconFileInfo>} component='a' href='/setup-instructions'>
                    Setup Instructions
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Menu trigger='click-hover' openDelay={100} closeDelay={400}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group>
                      <Image mah={24} maw={24} src={user.picture} alt='User profile picture'></Image>
                      <Text>{user.name}</Text>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item disabled>
                    {user.sub}
                  </Menu.Item>
                  <Menu.Item leftSection={<IconLogout></IconLogout>} onClick={logout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          : <>
            <UnstyledButton component='a' href='/'>Login</UnstyledButton>
          </>}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
