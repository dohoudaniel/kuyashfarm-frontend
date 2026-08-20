/**
 * Writing the blog. A Client Component throughout: `apiClient` holds its token
 * in module scope, which is shared across concurrent server requests, so a
 * staff token used from a Server Component would leak between visitors.
 */

import BlogAdminClient from "./BlogAdminClient";

export default function AdminBlogPage() {
  return <BlogAdminClient />;
}
