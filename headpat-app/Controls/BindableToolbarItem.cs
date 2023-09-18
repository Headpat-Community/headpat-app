using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Controls
{
    internal class BindableToolbarItem : ToolbarItem
    {
        public static readonly BindableProperty IsVisibleProperty =
            BindableProperty.Create(nameof(IsVisible), typeof(bool), typeof(BindableToolbarItem), true, BindingMode.OneWay, propertyChanged: OnIsVisibleChanged);

        public bool IsVisible
        {
            get => (bool)GetValue(IsVisibleProperty);
            set => SetValue(IsVisibleProperty, value);
        }

        protected override void OnParentChanged()
        {
            base.OnParentChanged();

            RefreshVisibility();
        }

        private static void OnIsVisibleChanged(BindableObject bindable, object oldvalue, object newvalue)
        {
            var item = bindable as BindableToolbarItem;

            item.RefreshVisibility();
        }

        private void RefreshVisibility()
        {
            if (Parent == null)
            {
                return;
            }

            bool value = IsVisible;

            var toolbarItems = ((ContentPage)Parent).ToolbarItems;

            if (value && !toolbarItems.Contains(this))
            {
                Application.Current.Dispatcher.Dispatch(() => { toolbarItems.Add(this); });
            }
            else if (!value && toolbarItems.Contains(this))
            {
                Application.Current.Dispatcher.Dispatch(() => { toolbarItems.Remove(this); });
            }
        }
    }
}
