---
{
  slug: "maybes-and-decoders-elm",
  template: "post",
  title: "Maybes and Decoders in elm",
  tags: ["web"],
  date: "2022-09-06",
  description: "I thought it would be useful to understand monads when using Elm, as it is a functional language. I found that...",
}
---

The Maybe value in Elm is useful when parsing a String into a floating point number, or when requesting data that may not exist from a server.
The response data in an Elm app is decoded by an Elm application and the value can then be handled with relative certainty.

This example of a Maybe value comes from the Elm documentation.

**Elm in the terminal ↓**

```VIM

String.toFloat
<function> : String -> Maybe Float

> String.toFloat “3.1415”
Just 3.1415 : Maybe Float

> String.toFloat “abc”
Nothing : Maybe Float
```

The string given to `toFloat` may not be a valid number, in which case the output of the toFloat method could be represented by some failure but to say the output is Maybe a float value makes sense.
A Maybe value can be something or nothing, where both something and nothing cases must be described - generally by using a `case` statement - which is the same as a JS `switch` statement.

**Elm ↓**

```ELM
let maybeFloat =
String.toFloat “3.1415”

let usefulValue =
	case maybeFloat of
		Just floatValue ->
			floatValue

		Nothing ->
			1.0
```

This case statement says that in a case where the value is nothing a default value of 1.0 is provided.
Default values should be meaningful and should make sense.

**Elm ↓**

```ELM

type Maybe a
   = Just a
   | Nothing
```

Below is an example of some metadata from a markdown blog post.
Values brought into an Elm app require decoding into Elm type values.

**Markdown blog post**

**Markdown ↓**

```Markdown
---
{
 slug: 'maybe-decoders-and-updaters-elm',
 title: 'Maybes, Decoders and updaters in elm',
 tags: ['web'],
 publishDate: '2018-09-12',
 description: 'This is a blog about Maybe values.',
}
---
This is a post about Maybe values.

```

**Elm decoder**

**Elm ↓**

```ELM
-- import Decoder as Decode exposing (Decoder)
type Decoder a


type alias BlogPostMetadata =
   { slug : String
   , title : String
   , tags : List String
   , publishDate : IsoString
   , description : String
   }


blogPostMetaDecoder : Decoder BlogPostMetadata
blogPostMetaDecoder =
   Decode.map5 BlogPostMetadata
       (Decode.field "slug" Decode.string)
       (Decode.field "title" Decode.string)
       (Decode.field "tags" (Decode.list Decode.string))
       (Decode.field "publishDate" Decode.string)
       (Decode.field "description" Decode.string)


```

A Decoder wraps data coming into an Elm application in a Functor and then tries to translate that data into a valid Elm type value.

`BlogPostMetadata` is a constructor that defines metadata from the markdown file above.
The markdown data is wrapped in a Decoder called `blogPostMetaDecoder`, which expects certain field values. Given a field name and a decoder, the Decoder should translate the data into an expected Elm value.

Each field decoder - Decode.field - is separate so the top level decoder performs a transformation called `map5` which takes 5 Decoder values and returns just one Decoder value. `map` is an important feature of both Maybe and Decoder values.

The `Decoder` type definition looks similar to the `Just` branch in a Maybe type.

A decoder and a Maybe value perform different functions but each one wraps a value in a functor. This functor is a type of monad.
A monad Functor has a `map` method and a `bind` method. A wrapped Maybe or Decode value can be transformed using the `map` method available on the monad.
It may also handle computations that return nested wrapped values - by using a `bind` method. `bind` exists in Elm on Maybe and Decode values as `andThen`.

Before learning Elm I wrote a lot of JavaScript and found the `Maybe.map` method confusing as I had only seen `map` used on arrays. The `map` method in each case does much the same thing.

**Elm ↓**

```ELM
-- Maybe
map : (a -> b) -> Maybe a -> Maybe b

andThen : (a -> Maybe b) -> Maybe a -> Maybe b


-- Decoders
map : (a -> value) -> Decoder a -> Decoder value

andThen : (a -> Decoder b) -> Decoder a -> Decoder b

-- Also Decoders. Helpful for dealing with optional fields.
maybe : Decoder a -> Decoder (Maybe a)

```

The type signatures in each case are the same apart from the functor wrapping the given value.

## Definitions

`map` -> Given a transformation and a functor-wrapped value,
output a transformed value wrapped in a functor.

`andThen` -> Given a transformation and a functor-wrapped value,
escape or flatten the first functor and output another wrapped value.

**Elm decoder with an optional field**
In the example below, the `authorName` value may not be included in the blog post metadata so in the UI an author’s name may not be displayed. This value is therefore wrapped in both a Decoder functor and also wrapped in a Maybe value functor and will need to be unwrapped from both Decoder and Maybe.

**Elm ↓**

```ELM
-- import Decoder as Decode exposing (Decoder)
type Decoder a


type alias BlogPostMetadata =
   { slug : String
   , title : String
   , tags : List String
   , publishDate : IsoString
   , description : String
   -- authorName is an optional field
   , authorName : Maybe String
   }


blogPostMetaDecoder : Decoder BlogPostMetadata
blogPostMetaDecoder =
   Decode.map5 BlogPostMetadata
       (Decode.field "slug" Decode.string)
       (Decode.field "title" Decode.string)
       (Decode.field "tags" (Decode.list Decode.string))
       (Decode.field "publishDate" Decode.string)
       (Decode.field "description" Decode.string)
       -- Their may not be an author field to decode
       (Decode.maybe (Decode.field "authorName" Decode.string))

```

The `authorName` field is optional and there is no meaningful default value.
In this particular case `Decode.maybe` is well suited to decoding the field, though if there was a meaningful default value a package like `Json-Decode-Pipeline` could be used to neatly handle a missing value.

https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#maybe

https://package.elm-lang.org/packages/NoRedInk/elm-json-decode-pipeline/latest/Json-Decode-Pipeline#optional

## Summary

My reason for writing this article was because I thought it would be useful to understand monads when using Elm, as it is a functional language. I found that understanding monads in great detail is not strictly necessary, however the journey to understanding has prompted me to ask questions at work and read many things. This post became far more practical than I expected.
