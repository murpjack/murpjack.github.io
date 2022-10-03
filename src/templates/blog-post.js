import React from "react"
import { graphql } from "gatsby"
import { DiscussionEmbed } from "disqus-react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const BlogPostTemplate = ({ data, _, location }) => {
  const post = data.markdownRemark
  const { title: siteTitle, slug, disqusShortname } = data.site.siteMetadata
  const isPostTemplate = post.frontmatter.template === "post"
  const disqusConfig = {
    shortname: disqusShortname,
    config: { identifier: slug, title: post.frontmatter.title },
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article itemScope className="blog-post">
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
      </article>

      {isPostTemplate && <DiscussionEmbed {...disqusConfig} />}

      {isPostTemplate && <footer></footer>}
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        disqusShortname
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
        description
        template
      }
    }
  }
`
