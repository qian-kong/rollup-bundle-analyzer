import debounce from 'lodash.debounce';

import s from './Search.css';
import Button from './Button';
import PureComponent from '../lib/PureComponent';

export default class Search extends PureComponent {
  input: any;

  componentDidMount() {
    if (this.props.autofocus) {
      this.focus();
    }
  }

  componentWillUnmount() {
    this.handleValueChange.cancel();
  }

  render() {
    const {label, query} = this.props;

    return (
      <div className={s.container}>
        <div className={s.label}>
          {label}:
        </div>
        <div className={s.row}>
          <input ref={this.saveInputNode}
            className={s.input}
            type="text"
            value={query}
            placeholder="Enter regexp"
            onInput={this.handleValueChange}
            onBlur={this.handleInputBlur}
            onKeyDown={this.handleKeyDown}/>
          <Button className={s.clear} onClick={this.handleClearClick}>x</Button>
        </div>
      </div>
    );
  }

  handleValueChange = debounce((event: { target: { value: any; }; }) => {
    this.informChange(event.target.value);
  }, 400)

  handleInputBlur = () => {
    this.handleValueChange.flush();
  }

  handleClearClick = () => {
    this.clear();
    this.focus();
  }

  handleKeyDown = (event: { key: any; stopPropagation: () => void; }) => {
    let handled = true;

    switch (event.key) {
      case 'Escape':
        this.clear();
        break;
      case 'Enter':
        this.handleValueChange.flush();
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.stopPropagation();
    }
  }

  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  clear() {
    this.handleValueChange.cancel();
    this.informChange('');
    this.input.value = '';
  }

  informChange(value: string) {
    this.props.onQueryChange(value);
  }

  saveInputNode = (node: any) => this.input = node;
}