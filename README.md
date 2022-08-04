# Choose-Your-Own-Solution

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

* If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Developing

### Template text
Most string properties support template text:
1. Wrapping text in curly braces `{}` will make them **emphasized**. For example: `"foo {bar} baz"` gets turned into "foo **bar** baz"
1. Wrapping text in curly braces _followed by an underscore_ `_{}` will instead make it <sub>subscript</sub> . For example: `foo_{bar}` gets turned into foo<sub>bar</sub> .
1. All instances of the newline character `\n` will be replaced by a line break, i.e. `<br/>` in HTML.
1. The following format `[text](url)` will result in a clickable link, similar to Markdown. For example, `[Better Plants](https://betterbuildingssolutioncenter.energy.gov/better-plants)` will result in [Better Plants](https://betterbuildingssolutioncenter.energy.gov/better-plants).

When an array of strings is passed into `parseSpecialText()`, the strings will be joined by two line breaks. This is useful when writing multiple paragraphs.

To add a component that supports this template syntax, you need to use React's [dangerouslySetInnerHTML](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml) property. Just make sure not to use it for any user-generated input. For example:

```jsx
return (
	// Turn:
	<Typography variant='body1'>{myProp}</Typography>
	// into:
	<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(myProp)}/>
)
```

### Switching to Resolvables
Some properties in `pageControls.tsx` and `projects.tsx` still just take strings, instead of supporting Resolvables, i.e., functions that return the desired type. For info on Resolvables, check `functions-and-types.tsx`. All you need to do to switch to a Resolvable is change (for example) is:
1. In the TypeScript interface declaration for props, change `myProp: string` to `myProp: Resolvable<string>`, and
1. In code for the component which takes the property, change all instances of `myProp` to `this.props.resolveToValue(myProp)`. All components are passed the function `App.resolveToValue`, which provides them full access to `App` via `this` as well as the app state via the first called function parameter.
