import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbItemData {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home is always the first item */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <span key={index} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
