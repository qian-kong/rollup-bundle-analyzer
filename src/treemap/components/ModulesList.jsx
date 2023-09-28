import cls from 'classnames';
import s from './ModulesList.css';
import ModuleItem from './ModuleItem.jsx';
import PureComponent from '../lib/PureComponent.jsx';

export default class ModulesList extends PureComponent {
  render({modules, showSize, highlightedText, isModuleVisible, className}) {
    return (
      <div className={cls(s.container, className)}>
        {modules.map(module =>
          <ModuleItem key={module.cid}
            module={module}
            showSize={showSize}
            highlightedText={highlightedText}
            isVisible={isModuleVisible}
            onClick={this.handleModuleClick}/>
        )}
      </div>
    );
  }

  handleModuleClick = module => this.props.onModuleClick(module);
}
