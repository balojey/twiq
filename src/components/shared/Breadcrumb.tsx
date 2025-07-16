
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to}>
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="capitalize">{value.replace(/-/g, " ")}</span>
              ) : (
                <Link to={to} className="capitalize">
                  {value.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
