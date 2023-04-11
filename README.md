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

### `npm run electron:serve`
Builds and serves the app with electron 
### `npm run electron:build`
Builds and packages the app with electron-builder, creates an installer executable in ../output folder

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Developing

Using Visual Studio Code is recommended for this project because of its built-in support for TypeScript. Make sure the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) plugin is installed for enforcing code style and automatic fixes of simple rules (like single-quote strings and tabbing). Most interfaces, types, and methods are documented with a combination of JSDoc and TypeScript. 

## Files

### Pages.tsx

`Pages.tsx` contains a dictionary of unique [symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) (think of them like enums). These symbols act as unique identifiers for both pages and projects. For example, anywhere in the app where we wish to refer to the Scope 1 Projects page, we use `Pages.scope1Projects`. If you wish to add a new Page symbol, simply add a line to Pages.tsx: `<key name>: Symbol('<string description>')`. To convert Page symbols to string, use their `.description` property.

Note: In the documentation, the term *Page symbol* is used frequently. This simply means one of the symbols exported from `Pages.tsx`, for example `Pages.start` and `Pages.winScreen`.

Note 2: The plan was originally to have a new page (e.g. an info dialog box) for each project, but then the `ProjectControl` class was created and it was separated into two dictionary objects (`PageControls` and `Projects`). 

### PageControls.tsx

`PageControls.tsx` contains a dictionary of control objects that tell the main app how to render the main page. The exact structure of a `PageControl` object is not necessary to understand for development because you can use generator functions like `newStartPageControl`, `newInfoDialogControl`, and `newGroupedChoicesControl` to create them. This simultaneously helps reduce uneccessary copied code and enables type checking for the different types of controls. 

#### PageCallback

The PageCallback type is defined in `functions-and-types.tsx` but it's worth mentioning here. During actions like button presses, the app expects to be told to update its `currentPage`, i.e., the symbol associated with the page that should display in the main view. PageCallbacks can either be a Page symbol in and of itself, OR a function which returns a Page symbol. See the JSdoc written in `functions-and-types.tsx` for more info.

### Projects.tsx

The top of `Projects.tsx` contains `Scope1Projects` and `Scope2Projects` which must be kept up to date, some type definitions, and a class definition for `ProjectControl`. Lower down, there are definitions for each project. `ProjectControl` contains properties and methods necessary for integrating projects in the rest of the app. `Projects` is a dictionary of `ProjectControl`s whose key is a Page symbol.

### App.tsx

`App.tsx` is the main app and contains the backbone for business logic. It passes properties from its `state` into child components, and PageCallbacks + Resolvables are [bound](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind) to the main app when they execute.

### functions-and-types.tsx

`functions-and-types.tsx` contains useful functions and type declarations used across the app. See the JSDoc inside the file for more.

### trackedStats.tsx

`trackedStats.tsx` contains definitions for, and functions related to, the stats that are tracked across the game such as budget and emissions.

## Adding new content

### Adding new projects

1. Create a new Page symbol for the project in `Pages.tsx`.
2. Add it to either `Scope1Projects` or `Scope2Projects`, depending on which scope it's in.
3. Create the new project in `Projects.tsx`. See the documentation on `ProjectControlParams` for info on the necessary parameters.
```js
Projects[Pages.myNewProject] = new ProjectControl({
	pageId: Pages.myNewProject,
	cost: 50_000,
	...
});
```
4. In the newGroupedChoicesControl parameters for `PageControls[Pages.scope1Projects]`, add `Projects[Pages.myNewProject].getProjectChoiceControl()` to the `choices` list of one of the `groups`.

### Adding new controllable components

1. Create a [React component](https://reactjs.org/docs/components-and-props.html) inside the `components` subfolder. 
```tsx
import { PureComponentIgnoreFuncs } from './functions-and-types';
import type { ControlCallbacks, PageControl } from './controls';

export class NewComponent extends PureComponentIgnoreFuncs {
	constructor(props) {
		super(props);
	}
	render() {
		return <h1>Hello world! My name is {this.props.name}</h1>;
	}
}
```
2. Define a "control props" interface for the component, for use in PageControls.
```tsx
interface NewComponentControlProps {
	name: string;
}
```
3. Make the component's `props` interface/type extend `ControlCallbacks` and those control props.
```tsx
interface NewComponentProps extends ControlCallbacks, NewComponentControlProps { /* Leave it empty */ }

class NewComponent extends PureComponentIgnoreFuncs <NewComponentProps> {
	constructor(props: NewComponentProps) {
		super(props);
	}
	render() {
		return <h1>Hello world! My name is {this.props.name}</h1>;
	}
}
```
4. Make a "newControl" constructor function for use in PageControls, which accepts your "control props" as its first parameter.
```tsx

export function newNewComponentControl(props: NewComponentControlProps, onBack: PageCallback): PageControl {
	return {
		componentClass: NewComponent,
		controlProps: props,
		onBack,
		hideDashboard: false, // you could also include hideDasboard as a required property of NewComponentControlProps, like in GroupedChoicesControlProps
	}
}
```
5. In `App.tsx` -> `CurrentPage`, include the new component in the switch statement, depending on what props you wish to pass it.
```tsx
	switch (this.props.componentClass) {
		case StartPage:
		case GroupedChoices:
		case NewComponent:
			if (!this.props.controlProps) throw new Error('currentPageProps not defined'); 
			return (<this.props.componentClass
				{...this.props.controlProps} // Pass everything into the child
				{...controlCallbacks}
			/>);
		...
	}
```
## Misc.

### Template text
Most string properties support template text:
1. Wrapping text in curly braces `{}` will make them **emphasized**. For example: `"foo {bar} baz"` gets turned into "foo **bar** baz".
**Note**: Do not confuse these braces with JS _template strings_: 
```js
let x = `hello world, my variable = ${myVariable}!`;
```
2. Wrapping text in curly braces _followed by an underscore_ `_{}` will instead make it <sub>subscript</sub> . For example: `foo_{bar}` gets turned into foo<sub>bar</sub> .
3. All instances of the newline character `\n` will be replaced by a line break, i.e. `<br/>` in HTML.
4. The following format `[text](url)` will result in a clickable link, similar to Markdown. For example, `[Better Plants](https://betterbuildingssolutioncenter.energy.gov/better-plants)` will result in [Better Plants](https://betterbuildingssolutioncenter.energy.gov/better-plants).

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

### Icons

First, search for icons that may work in [MUI's Material Icons page](https://mui.com/material-ui/material-icons/#main-content). It comes with over 2,000 icons, and they're easy to import.

```jsx
import BoltIcon from '@mui/icons-material/Bolt';
const icon = <BoltIcon/>;
```

If no icons that fit what you're looking for, try [iconmonstr](https://iconmonstr.com/). They're already included in the attributions section. Download it as an **svg**, then do the following:

1. Create a new file in the `icons` subfolder. For example: `SmileSunglassesIcon.tsx`
2. Add the following to the top:
```jsx
import React from 'react';
import { createSvgIcon } from '@mui/material';
```
3. Open the svg file downloaded from iconmonstr. Copy everything INSIDE the `<svg></svg>` tags and place it according to the following pattern:
```jsx
export default createSvgIcon(
	<Contents_of_SVG>,
	'Name of SVG icon'
);
```
Example:

```svg
<!-- iconmonstr-smiley-20.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c3.691 0 6.915 2.016 8.647 5h-17.294c1.732-2.984 4.956-5 8.647-5zm0 20c-5.514 0-10-4.486-10-10 0-1.045.163-2.052.461-3h1.859c.606 1.518 1.929 3 3.986 3 2.477 0 2.153-2.31 3.694-2.31s1.218 2.31 3.695 2.31c2.055 0 3.379-1.482 3.984-3h1.86c.298.948.461 1.955.461 3 0 5.514-4.486 10-10 10zm5.508-8.059l.492.493c-1.127 1.72-3.199 3.566-5.999 3.566-2.801 0-4.874-1.846-6.001-3.566l.492-.493c1.513 1.195 3.174 1.931 5.509 1.931 2.333 0 3.994-.736 5.507-1.931z"/></svg>
```
becomes
```jsx
// icons/SmileSunglassesIcon.tsx
import React from 'react';
import { createSvgIcon } from '@mui/material';

export default createSvgIcon(
	<path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c3.691 0 6.915 2.016 8.647 5h-17.294c1.732-2.984 4.956-5 8.647-5zm0 20c-5.514 0-10-4.486-10-10 0-1.045.163-2.052.461-3h1.859c.606 1.518 1.929 3 3.986 3 2.477 0 2.153-2.31 3.694-2.31s1.218 2.31 3.695 2.31c2.055 0 3.379-1.482 3.984-3h1.86c.298.948.461 1.955.461 3 0 5.514-4.486 10-10 10zm5.508-8.059l.492.493c-1.127 1.72-3.199 3.566-5.999 3.566-2.801 0-4.874-1.846-6.001-3.566l.492-.493c1.513 1.195 3.174 1.931 5.509 1.931 2.333 0 3.994-.736 5.507-1.931z"/>,
	'SmileSunglassesIcon',
);
```

# Acknowledgements

This tool was developed by staff at Oak Ridge National Laboratory (ORNL) and in collaboration with the U.S. Department of Energy. This software tool was funded by the U.S. Department of Energy's Office of Energy Efficiency and Renewable Energy under Oak Ridge National Laboratory Contract No. DE-AC05-00OR22725.

## Personnel

### Oak Ridge National Laboratory staff

- Gina Accawi
- Kristina Armstrong
- Paulomi Nandy
- Sachin Nimbalkar
- Thomas Wenning

### Contractors and Oak Ridge Associated Universities student employees

- Rachel Hernandez

### Student Undergraduate Laboratory Internship participants

- Jordan Lees

## Software

Choose Your Own Solution was made possible by open-source software, most notably including:

- React (https://reactjs.org/)
- MUI / Material UI (https://mui.com/)
- visx (https://airbnb.io/visx/)
- react-spring (https://react-spring.dev/)
- Sass (https://sass-lang.com/)
- Node.JS (https://nodejs.org/en/)
- TypeScript (https://www.typescriptlang.org/)
- Icons from iconmonstr (https://iconmonstr.com/)
