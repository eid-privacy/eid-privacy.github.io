# Prints a Typst list of all blog posts: "Date - #link(URL)[title]"
require "jekyll"

BASE_URL = "https://eid-privacy.github.io"

def typst_escape(text)
  text.gsub(/[\\\[\]#*_$@<>`~\/]/) { |c| "\\#{c}" }
end

site = Jekyll::Site.new(Jekyll.configuration("quiet" => true))
site.read
site.posts.docs.sort_by(&:date).each do |post|
  date = post.date.strftime("%Y-%m-%d")
  url = BASE_URL + post.url
  puts "- #{date} - #link(\"#{url}\")[#{typst_escape(post.data["title"])}]"
end
